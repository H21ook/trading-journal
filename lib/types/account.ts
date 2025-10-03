export interface Account {
  id: number;
  name: string;
  type: "forex" | "stocks" | "crypto";
  initialDeposit: number;
  currentBalance: number;
  createdAt: string;
}

export interface BalanceTransaction {
  id: string;
  accountId: string;
  type: "deposit" | "withdrawal" | "adjustment";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  notes?: string;
  date: string;
}
