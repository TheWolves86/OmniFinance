export type TransactionType = "income" | "expense";

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
