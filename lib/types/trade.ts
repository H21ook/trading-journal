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
  account_id: number;
  action: Action;
  action_type: ActionType;
  created_at: string;
  emotion: string;
  id: string;
  note?: string;
  risk_to_reward: number;
  status: TradeStatus;
  symbol_id: number;
  user_id: string;
  rule_ids: string[]
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
  is_active?: boolean;
  created_at: string;
}

export interface Rule {
  id: string;
  title: string;
  description?: string;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
}
