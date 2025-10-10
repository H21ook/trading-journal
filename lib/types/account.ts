export interface Account {
  id: number;
  name: string;
  type: "forex" | "stocks" | "crypto";
  initial_deposit: number;
  current_balance: number;
  created_at: string;
}

export interface BalanceTransaction {
  id: string;
  account_id: number;
  type: "deposit" | "withdrawal" | "adjustment";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  notes?: string;
  date: string;
}
