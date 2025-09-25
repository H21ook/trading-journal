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

export interface TradeEntry {
  id: string;
  accountId: string; // Added accountId to link trades to accounts
  symbol: string;
  action: "buy" | "sell";
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  takeProfitAmount?: number;
  stopLossAmount?: number;
  date: string;
  notes: string;
  status: "open" | "closed";
  profitLoss?: number;
  rulesFollowed?: string[]; // Added rules tracking
  emotions?: string; // Added emotions field
  hashtags?: string[]; // Added hashtags field
  riskRewardRatio?: "" | "1:1" | "1:2" | "1:3" | "1:5"; // Added risk/reward ratio
  closureType?: "TP" | "SL" | "BE" | "CUSTOM"; // Added closure type tracking
}

export interface Symbol {
  id: string;
  symbol: string;
  name: string;
  type: "forex" | "stocks" | "crypto";
  createdAt: string;
}

export interface TradingRule {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}
