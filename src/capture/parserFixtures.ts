import type { DetectedTransactionType } from "@/src/types/models";

export const parserTestCases: Array<{ text: string; expectedType: DetectedTransactionType; expectedAmount: number; expectedMerchant?: string }> = [
  { text: "Paid Rs. 450 to Swiggy using UPI", expectedType: "expense", expectedAmount: 450, expectedMerchant: "Swiggy" },
  { text: "Rs. 250 debited from HDFC Bank", expectedType: "expense", expectedAmount: 250 },
  { text: "Received Rs. 2,000 from Rahul", expectedType: "income", expectedAmount: 2000, expectedMerchant: "Rahul" },
  { text: "UPI payment of Rs. 1,250 to AMAZON", expectedType: "expense", expectedAmount: 1250, expectedMerchant: "AMAZON" },
  { text: "Payment successful: Rs. 799 at NETFLIX", expectedType: "expense", expectedAmount: 799, expectedMerchant: "NETFLIX" },
  { text: "Refund of Rs. 450 received from Swiggy", expectedType: "income", expectedAmount: 450, expectedMerchant: "Swiggy" },
  { text: "Transferred Rs. 5,000 to SBI account", expectedType: "transfer", expectedAmount: 5000, expectedMerchant: "SBI account" },
];
