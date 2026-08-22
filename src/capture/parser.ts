import type { DetectedTransactionType } from "@/src/types/models";

export type NotificationInput = { packageName?: string; appName?: string; title?: string; text?: string; timestamp?: number; key?: string };
export type ParsedCandidate = { source: string; sourcePackage?: string; sourceApp?: string; rawText: string; merchant?: string; amount: number; type: DetectedTransactionType; transactionDate: number; referenceId?: string; accountHint?: string; upiHandle?: string; parser: string; parserVersion: string; confidence: number };

const sourceMap: Record<string, string> = {
  "com.google.android.apps.walletnfcrel": "google_pay",
  "com.google.android.apps.nbu.paisa.user": "google_pay",
  "com.phonepe.app": "phonepe",
  "net.one97.paytm": "paytm",
  "com.samsung.android.spay": "samsung_wallet",
  "com.google.android.apps.messaging": "bank_sms",
  "com.samsung.android.messaging": "bank_sms",
  "com.android.mms": "bank_sms",
  "com.snapwork.hdfc": "hdfc_bank",
  "com.csam.icici.bank.imobile": "icici_bank",
  "com.axis.mobile": "axis_bank",
  "com.sbi.lotusintouch": "sbi_bank",
  "in.org.npci.upiapp": "bhim_upi",
  "com.dreamplug.androidapp": "cred",
  "com.whatsapp": "whatsapp_pay",
  "in.amazon.mShop.android.shopping": "amazon_pay",
  "com.msf.kalyan": "kotak_bank",
};

function money(s: string): number | null {
  const currencyPattern = /(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/gi;
  const matches: Array<{ amount: number; index: number; fullMatch: string }> = [];
  let match: RegExpExecArray | null;

  while ((match = currencyPattern.exec(s)) !== null) {
    const val = Number(match[1].replace(/,/g, ""));
    if (Number.isFinite(val) && val > 0) {
      matches.push({ amount: val, index: match.index, fullMatch: match[0] });
    }
  }

  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0].amount;

  const actionPattern = /\b(debited|spent|paid|sent|credited|received|transferred|withdrawn|purchase|payment)\b/i;
  const balancePattern = /\b(bal|balance|avail|available|limit|a\/c bal)\b/i;

  for (const m of matches) {
    const start = Math.max(0, m.index - 30);
    const end = Math.min(s.length, m.index + m.fullMatch.length + 30);
    const windowText = s.slice(start, end);

    if (actionPattern.test(windowText) && !balancePattern.test(windowText.slice(0, m.index - start))) {
      return m.amount;
    }
  }

  for (const m of matches) {
    const before = s.slice(Math.max(0, m.index - 20), m.index);
    if (!balancePattern.test(before)) {
      return m.amount;
    }
  }

  return matches[0].amount;
}

const cleanMerchant = (s: string) => s.replace(/\b(using|via|with|from|to|on|for)\b.*$/i, "").replace(/[^\w &'&.-]/g, "").trim() || undefined;

export function parsePaymentNotification(input: NotificationInput): ParsedCandidate | null {
  const rawText = [input.title, input.text].filter(Boolean).join(" - ").trim();
  if (!rawText) return null;

  const lower = rawText.toLowerCase();
  const isFinancialText = /(?:₹|rs\.?|inr|debited|credited|transferred|spent|paid|received)/i.test(lower);
  if (!isFinancialText) return null;

  const source = sourceMap[input.packageName ?? ""] || (isFinancialText ? (input.appName?.toLowerCase().replace(/\s+/g, "_") || "notification") : null);
  if (!source) return null;

  const amount = money(rawText);
  if (amount === null || amount <= 0) return null;

  const isTransfer = /transferred|transfer to|transfer from/.test(lower);
  const isIncome = /received|credited|refund|cashback/.test(lower);
  const type: DetectedTransactionType = isTransfer ? "transfer" : isIncome ? "income" : "expense";
  const direction = isIncome ? /(?:from|by)\s+(.+?)(?:\s+(?:on|via|using)\b|$)/i : /(?:to|at)\s+(.+?)(?:\s+(?:using|via|on)\b|$)/i;
  const directionMatch = direction.exec(rawText);
  const merchant = directionMatch?.[1] ? cleanMerchant(directionMatch[1]) : undefined;
  const referenceId = rawText.match(/(?:upi|ref(?:erence)?|txn(?:\s*id)?)\s*[:#-]?\s*([A-Z0-9]{6,})/i)?.[1];
  const upiHandle = rawText.match(/[\w.-]+@[\w.-]+/)?.[0];
  return { source: isTransfer ? `${source}_transfer` : source, sourcePackage: input.packageName, sourceApp: input.appName, rawText, merchant, amount, type, transactionDate: input.timestamp ?? Date.now(), referenceId, upiHandle, parser: `${source}NotificationParser`, parserVersion: "1.1", confidence: referenceId ? 0.96 : merchant ? 0.82 : 0.65 };
}
