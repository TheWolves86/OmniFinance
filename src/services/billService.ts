import { db } from "../db";
import { getAccountById, updateBalance } from "../db/repository/account";
import { getBillById, setBillPaid } from "../db/repository/bills";
import { createTransaction } from "../db/repository/transaction";

export async function payBill(billId: string, accountId: string, categoryId: string) {
  if (!billId || !accountId || !categoryId) throw new Error("Bill payment details are incomplete");

  await db.withExclusiveTransactionAsync(async () => {
    const bill = await getBillById(billId);
    if (!bill) throw new Error("Bill not found");
    if (Boolean(bill.isPaid)) throw new Error("Bill has already been paid");

    const account = await getAccountById(accountId);
    if (!account) throw new Error("Account not found");

    const changed = await setBillPaid(billId, Date.now());
    if (!changed) throw new Error("Bill has already been paid");

    await createTransaction({
      title: `Bill: ${bill.title}`,
      amount: bill.amount,
      type: "expense",
      categoryId,
      accountId,
      note: `Payment for ${bill.title}`,
      transactionDate: Date.now(),
    });
    await updateBalance(account.id, account.balance - bill.amount);
  });
}
