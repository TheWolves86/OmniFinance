export type TransactionType = "income" | "expense";
export type DetectedTransactionType = TransactionType | "transfer";

export type Account = {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  icon?: string | null;
  color?: string | null;
  isDefault: boolean | number;
  createdAt?: number;
  updatedAt?: number;
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  color?: string;
  type?: TransactionType;
  isDefault?: boolean | number;
  createdAt?: number;
};

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  categoryName?: string | null;
  accountName?: string | null;
  note?: string | null;
  transactionDate: number;
  createdAt?: number;
  updatedAt?: number;
};

export type TransactionSection = {
  title: string;
  data: Transaction[];
  order: number;
};

export type DetectedTransactionStatus = "detected" | "paused" | "approved" | "deleted" | "duplicate";

export type DetectedTransaction = {
  id: string;
  source: string;
  sourcePackage?: string | null;
  sourceApp?: string | null;
  rawText: string;
  merchant?: string | null;
  amount: number;
  type: DetectedTransactionType;
  transactionDate: number;
  accountId?: string | null;
  transferToAccountId?: string | null;
  categoryId?: string | null;
  referenceId?: string | null;
  accountHint?: string | null;
  upiHandle?: string | null;
  parser?: string | null;
  parserVersion?: string | null;
  confidence: number;
  status: DetectedTransactionStatus;
  duplicateOf?: string | null;
  note?: string | null;
  createdAt: number;
  updatedAt: number;
  categoryName?: string | null;
};
