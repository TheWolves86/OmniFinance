import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { getAllAccounts } from "@/src/db/repository/account";
import { createLoan, deleteLoan, makeLoanPayment, updateLoan, type Loan } from "@/src/db/repository/loan";
import { dismissLoanSheet, emitLoanChanged, registerLoanSheet, subscribeLoanSheet, type LoanSheetPayload } from "@/src/components/loanSheetController";

type Account = { id: string; name: string; balance: number };

const AddLoanSheet = forwardRef<BottomSheetModal>((_, _ref) => {
  const modalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["82%"], []);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [loan, setLoan] = useState<Loan | null>(null);
  const [paymentMode, setPaymentMode] = useState(false);
  const [name, setName] = useState("");
  const [lender, setLender] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [remainingAmount, setRemainingAmount] = useState("");
  const [monthlyEMI, setMonthlyEMI] = useState("");
  const [totalMonths, setTotalMonths] = useState("");
  const [paidMonths, setPaidMonths] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);

  const reset = useCallback(() => {
    setMode("create"); setLoan(null); setPaymentMode(false); setName(""); setLender("");
    setTotalAmount(""); setRemainingAmount(""); setMonthlyEMI(""); setTotalMonths("");
    setPaidMonths(""); setPaymentAmount(""); setAccountId("");
  }, []);

  useEffect(() => {
    registerLoanSheet(modalRef.current);
    return () => registerLoanSheet(null);
  }, []);

  useEffect(() => {
    return subscribeLoanSheet((payload: LoanSheetPayload) => {
      setPaymentMode(false);
      setMode(payload.mode);
      setLoan(payload.loan ?? null);
      if (payload.loan) {
        setName(payload.loan.name); setLender(payload.loan.lender);
        setTotalAmount(String(payload.loan.totalAmount)); setRemainingAmount(String(payload.loan.remainingAmount));
        setMonthlyEMI(String(payload.loan.monthlyEMI)); setTotalMonths(String(payload.loan.totalMonths));
        setPaidMonths(String(payload.loan.paidMonths));
      } else reset();
    });
  }, [reset]);

  const loadAccounts = async () => {
    const data = await getAllAccounts();
    setAccounts(data as Account[]);
    if (!accountId && data[0]) setAccountId(data[0].id);
  };

  const openPayment = async () => {
    try { await loadAccounts(); setPaymentMode(true); }
    catch { Alert.alert("Unable to load accounts"); }
  };

  const numeric = (value: string) => Number(value.replace(/,/g, ""));
  const save = async () => {
    const total = numeric(totalAmount); const remaining = numeric(remainingAmount);
    const emi = numeric(monthlyEMI); const months = numeric(totalMonths); const paid = numeric(paidMonths || "0");
    if (!name.trim() || !lender.trim()) return Alert.alert("Enter the loan name and lender");
    if (![total, remaining, emi, months, paid].every(Number.isFinite) || total <= 0 || remaining < 0 || remaining > total || emi <= 0 || months <= 0 || paid < 0 || paid > months) {
      return Alert.alert("Enter valid loan amounts and month values");
    }
    try {
      const data = { name: name.trim(), lender: lender.trim(), totalAmount: total, remainingAmount: remaining, monthlyEMI: emi, totalMonths: months, paidMonths: paid, status: remaining === 0 ? "completed" : "active" };
      if (mode === "edit" && loan) await updateLoan(loan.id, data); else await createLoan(data);
      emitLoanChanged(); dismissLoanSheet();
    } catch (error) { Alert.alert("Could not save loan", String(error)); }
  };

  const remove = () => {
    if (!loan) return;
    Alert.alert("Delete loan?", `This will permanently remove ${loan.name}.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { try { await deleteLoan(loan.id); emitLoanChanged(); dismissLoanSheet(); } catch (error) { Alert.alert("Could not delete loan", String(error)); } } }
    ]);
  };

  const pay = async () => {
    const amount = numeric(paymentAmount);
    if (!accountId) return Alert.alert("Select an account");
    if (!Number.isFinite(amount) || amount <= 0) return Alert.alert("Enter a valid payment amount");
    try { await makeLoanPayment(loan?.id ?? "", accountId, amount); emitLoanChanged(); dismissLoanSheet(); }
    catch (error) { Alert.alert("Payment failed", String(error).replace("Error: ", "")); }
  };

  const renderBackdrop = useCallback((props: any) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.35} pressBehavior="close" />, []);
  const input = (label: string, value: string, setValue: (value: string) => void, keyboardType: "numeric" | "default" = "default") => (
    <View style={styles.field} key={label}><Text style={styles.label}>{label}</Text><BottomSheetTextInput value={value} onChangeText={setValue} keyboardType={keyboardType} style={styles.input} placeholderTextColor="#A1A8B5" /></View>
  );

  return <BottomSheetModal ref={modalRef} index={0} snapPoints={snapPoints} backdropComponent={renderBackdrop} enablePanDownToClose onDismiss={reset} handleIndicatorStyle={styles.handle} backgroundStyle={styles.background}>
    <BottomSheetScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><Pressable onPress={() => modalRef.current?.dismiss()}><Text style={styles.cancel}>Cancel</Text></Pressable><Text style={styles.title}>{paymentMode ? "Make Payment" : mode === "edit" ? "Edit Loan" : "New Loan"}</Text><Pressable onPress={paymentMode ? pay : save}><Text style={styles.save}>{paymentMode ? "Pay" : mode === "edit" ? "Update" : "Save"}</Text></Pressable></View>
      {paymentMode ? <>
        <Text style={styles.paymentHint}>Paying {loan?.name} · {loan?.remainingAmount.toLocaleString("en-IN")} remaining</Text>
        {input("PAYMENT AMOUNT", paymentAmount, setPaymentAmount, "numeric")}
        <Text style={styles.label}>PAY FROM</Text>
        {accounts.map((account) => <Pressable key={account.id} style={[styles.accountRow, account.id === accountId && styles.selectedAccount]} onPress={() => setAccountId(account.id)}><Text style={styles.accountName}>{account.name}</Text><Text style={styles.accountBalance}>₹{account.balance.toLocaleString("en-IN")}</Text></Pressable>)}
        <Pressable style={styles.secondaryButton} onPress={() => setPaymentMode(false)}><Text style={styles.secondaryText}>Back to Loan</Text></Pressable>
      </> : <>
        {input("LOAN NAME", name, setName)}{input("LENDER / BANK", lender, setLender)}{input("TOTAL AMOUNT", totalAmount, setTotalAmount, "numeric")}{input("REMAINING AMOUNT", remainingAmount, setRemainingAmount, "numeric")}{input("MONTHLY EMI", monthlyEMI, setMonthlyEMI, "numeric")}{input("TOTAL MONTHS", totalMonths, setTotalMonths, "numeric")}{input("PAID MONTHS", paidMonths, setPaidMonths, "numeric")}
        {mode === "edit" && <><Pressable style={styles.paymentButton} onPress={openPayment}><Text style={styles.paymentText}>Make Payment</Text></Pressable><Pressable style={styles.deleteButton} onPress={remove}><Text style={styles.deleteText}>Delete Loan</Text></Pressable></>}
      </>}
    </BottomSheetScrollView>
  </BottomSheetModal>;
});

AddLoanSheet.displayName = "AddLoanSheet";
export default AddLoanSheet;

const styles = StyleSheet.create({
  background: { backgroundColor: "#F7F8FA", borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  handle: { backgroundColor: "#FFFFFF", width: 44, height: 5 },
  content: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 36 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  cancel: { fontSize: 16, color: "#6B7280" }, title: { fontSize: 18, fontWeight: "700", color: "#0B1D3A" }, save: { fontSize: 16, fontWeight: "700", color: "#0B1D3A" },
  field: { marginBottom: 16 }, label: { fontSize: 11, fontWeight: "700", letterSpacing: 1, color: "#8A93A6", marginBottom: 8 },
  input: { height: 48, borderWidth: 1, borderColor: "#E8ECF2", borderRadius: 14, backgroundColor: "#FFFFFF", paddingHorizontal: 14, fontSize: 15, color: "#0B1D3A" },
  paymentHint: { color: "#6B7280", marginBottom: 20 }, accountRow: { flexDirection: "row", justifyContent: "space-between", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: "#E8ECF2", backgroundColor: "#FFFFFF", marginTop: 8 }, selectedAccount: { borderColor: "#0B1D3A", backgroundColor: "#EEF1F6" }, accountName: { color: "#0B1D3A", fontWeight: "600" }, accountBalance: { color: "#6B7280" },
  paymentButton: { backgroundColor: "#0B1D3A", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 4 }, paymentText: { color: "#FFFFFF", fontWeight: "700" },
  deleteButton: { borderWidth: 1, borderColor: "#EF4444", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 10 }, deleteText: { color: "#EF4444", fontWeight: "700" },
  secondaryButton: { borderWidth: 1, borderColor: "#E8ECF2", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 24 }, secondaryText: { color: "#0B1D3A", fontWeight: "700" },
});
