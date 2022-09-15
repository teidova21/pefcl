/* Exports used with framework integrations */

import { Card, InventoryCard } from './BankCard';

export interface FrameworkIntegrationExports {
  /* Cash exports */
  getCash(source: number): number;
  addCash: (source: number, amount: number) => void;
  removeCash: (source: number, amount: number) => void;
  giveCard: (source: number, card: Card) => void;
  getCards: (source: number) => InventoryCard[];
}

export type FrameworkIntegrationFunction = keyof FrameworkIntegrationExports;
