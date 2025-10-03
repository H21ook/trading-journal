export interface NewEntry {
  symbol: string;
  action: "buy" | "sell";
  quantity: string;
  entryPrice: string;
  exitPrice?: string;
  takeProfitAmount?: string;
  stopLossAmount?: string;
  notes: string;
  riskRewardRatio?: "" | "1:1" | "1:2" | "1:3" | "1:5";
}
export enum Action {
  BUY = "buy",
  SELL = "sell",
}

export enum ActionType {
  LIMIT = "limit",
  MARKET = "market",
  STOP = "stop",
}

export enum TradeStatus {
  OPEN = "open",
  CLOSED = "closed",
}
export interface TradeEntry {
  accountId: number;
  action: Action;
  actionType: ActionType;
  createdAt: string;
  emotion: string;
  id: string;
  note?: string;
  riskToReward: number;
  status: TradeStatus;
  symbolId: number;
  userId: string;
}

export enum SymbolType {
  FOREX = "forex",
  STOCKS = "stocks",
  CRYPTO = "crypto",
  FUTURES = "futures",
  INDICES = "indices",
}
export interface Symbol {
  id: number;
  symbol: string;
  name: string;
  type: SymbolType;
  isActive?: boolean;
  createdAt: string;
}

export interface Rule {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}
