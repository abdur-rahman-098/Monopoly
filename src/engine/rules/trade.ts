import { PURCHASABLE_BY_ID } from '@/engine/data/properties';
import type { GameState, TradeProposal } from '@/engine/models/types';
import { addLogEntry, getPlayer, updatePlayer } from '@/engine/rules/helpers';

function validateSide(
  propertyIds: string[],
  ownerId: string,
  state: GameState
): { valid: true } | { valid: false; reason: string } {
  for (const propertyId of propertyIds) {
    const asset = PURCHASABLE_BY_ID[propertyId];
    if (!asset) {
      return { valid: false, reason: `RULES: Unknown property id "${propertyId}".` };
    }
    const record = state.ownership[propertyId];
    if (!record || record.ownerId !== ownerId) {
      return { valid: false, reason: `RULES: "${asset.name}" is not owned by the offering player.` };
    }
    if (record.isMortgaged) {
      return { valid: false, reason: `RULES: "${asset.name}" is mortgaged and cannot be traded.` };
    }
    if (record.buildings > 0) {
      return { valid: false, reason: `RULES: "${asset.name}" has buildings and cannot be traded.` };
    }
  }
  return { valid: true };
}

export function validateTrade(
  proposal: TradeProposal,
  state: GameState
): { valid: true } | { valid: false; reason: string } {
  const proposer = getPlayer(proposal.proposerId, state);
  const recipient = getPlayer(proposal.recipientId, state);

  const offeredCheck = validateSide(proposal.offeredPropertyIds, proposal.proposerId, state);
  if (!offeredCheck.valid) return offeredCheck;

  const requestedCheck = validateSide(proposal.requestedPropertyIds, proposal.recipientId, state);
  if (!requestedCheck.valid) return requestedCheck;

  if (proposal.offeredCash > proposer.cash) {
    return { valid: false, reason: 'RULES: Proposer does not have enough cash to offer.' };
  }
  if (proposal.requestedCash > recipient.cash) {
    return { valid: false, reason: 'RULES: Recipient does not have enough cash to fulfil the request.' };
  }
  if (proposal.includesOfferedGoojf && proposer.getOutOfJailFreeCards < 1) {
    return { valid: false, reason: 'RULES: Proposer does not hold a Get Out of Jail Free card.' };
  }
  if (proposal.includesRequestedGoojf && recipient.getOutOfJailFreeCards < 1) {
    return { valid: false, reason: 'RULES: Recipient does not hold a Get Out of Jail Free card.' };
  }

  return { valid: true };
}

export function executeTrade(proposal: TradeProposal, state: GameState): GameState {
  const check = validateTrade(proposal, state);
  if (!check.valid) {
    throw new Error(`RULES: Cannot execute invalid trade — ${check.reason}`);
  }
  if (proposal.status !== 'accepted') {
    throw new Error('RULES: Cannot execute a trade that has not been accepted.');
  }

  let newState = state;

  for (const propertyId of proposal.offeredPropertyIds) {
    const record = newState.ownership[propertyId];
    if (!record) throw new Error(`RULES: Missing ownership record for "${propertyId}".`);
    newState = {
      ...newState,
      ownership: {
        ...newState.ownership,
        [propertyId]: { ...record, ownerId: proposal.recipientId },
      },
    };
  }

  for (const propertyId of proposal.requestedPropertyIds) {
    const record = newState.ownership[propertyId];
    if (!record) throw new Error(`RULES: Missing ownership record for "${propertyId}".`);
    newState = {
      ...newState,
      ownership: {
        ...newState.ownership,
        [propertyId]: { ...record, ownerId: proposal.proposerId },
      },
    };
  }

  if (proposal.offeredCash > 0) {
    newState = updatePlayer(proposal.proposerId, newState, (p) => ({
      ...p,
      cash: p.cash - proposal.offeredCash,
    }));
    newState = updatePlayer(proposal.recipientId, newState, (p) => ({
      ...p,
      cash: p.cash + proposal.offeredCash,
    }));
  }

  if (proposal.requestedCash > 0) {
    newState = updatePlayer(proposal.recipientId, newState, (p) => ({
      ...p,
      cash: p.cash - proposal.requestedCash,
    }));
    newState = updatePlayer(proposal.proposerId, newState, (p) => ({
      ...p,
      cash: p.cash + proposal.requestedCash,
    }));
  }

  if (proposal.includesOfferedGoojf) {
    newState = updatePlayer(proposal.proposerId, newState, (p) => ({
      ...p,
      getOutOfJailFreeCards: p.getOutOfJailFreeCards - 1,
    }));
    newState = updatePlayer(proposal.recipientId, newState, (p) => ({
      ...p,
      getOutOfJailFreeCards: p.getOutOfJailFreeCards + 1,
    }));
  }

  if (proposal.includesRequestedGoojf) {
    newState = updatePlayer(proposal.recipientId, newState, (p) => ({
      ...p,
      getOutOfJailFreeCards: p.getOutOfJailFreeCards - 1,
    }));
    newState = updatePlayer(proposal.proposerId, newState, (p) => ({
      ...p,
      getOutOfJailFreeCards: p.getOutOfJailFreeCards + 1,
    }));
  }

  const proposer = getPlayer(proposal.proposerId, newState);
  const recipient = getPlayer(proposal.recipientId, newState);
  newState = addLogEntry(newState, {
    playerId: proposal.proposerId,
    description: `${proposer.name} and ${recipient.name} completed a trade.`,
  });

  newState = { ...newState, activeTradeProposal: null };

  return newState;
}
