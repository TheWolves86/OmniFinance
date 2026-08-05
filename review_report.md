## JULES REVIEW REPORT
Date: 2026-08-05
Project: OmniFinance
Files Reviewed: 8

---

### 🔴 CRITICAL SECURITY ISSUES (0)
None found this session.

---

### 🟠 BUGS & ERROR HANDLING (4)

File: app/(tabs)/activity.tsx
Line: 95
Issue: Usage of Math.random() in React Native FlatList/SectionList keyExtractor.
Why it's dangerous: Using Math.random() for keys causes components to completely unmount and remount on every render, losing state, degrading performance, and creating UI bugs.
Fix:
```typescript
<<<<<<< SEARCH
        keyExtractor={(item) => String(item?.id ?? Math.random())}
=======
        keyExtractor={(item, index) => String(item?.id ?? index.toString())}
>>>>>>> REPLACE
```

File: app/(tabs)/dashboard.tsx
Line: 29
Issue: Logging raw error objects and lacking context string in catch blocks.
Why it's dangerous: Raw errors could leak sensitive execution data. Logging errors without context makes debugging impossible.
Fix:
```typescript
<<<<<<< SEARCH
      console.error(error)
=======
      console.error("Error loading dashboard data:", error)
>>>>>>> REPLACE
```

File: app/(quick_name)/accounts.tsx
Line: 45
Issue: Lacking context string in catch block.
Why it's dangerous: Hard to debug if error log has no context.
Fix:
```typescript
<<<<<<< SEARCH
      console.error(error)
=======
      console.error("Error loading accounts:", error)
>>>>>>> REPLACE
```

File: src/components/transactionBottomSheet.tsx
Line: 240
Issue: Lacking context string in catch block.
Why it's dangerous: Hard to debug if error log has no context.
Fix:
```typescript
<<<<<<< SEARCH
      console.error(error)
=======
      console.error("Error saving transaction:", error)
>>>>>>> REPLACE
```

---

### 🟡 PERFORMANCE ISSUES (1)

File: app/(tabs)/activity.tsx
Line: 95
Issue: Math.random() as key in SectionList.
Why it's dangerous: Math.random() breaks component identity across renders, forcing expensive full re-renders of the list instead of efficiently recycling views. Fixed in BUG category.

---

### 🔵 CODE QUALITY (0)
None found this session.

---

### ✅ FIXES APPLIED
- `app/(tabs)/activity.tsx`: Line 95 - Replaced `Math.random()` with `index.toString()` in `keyExtractor`.
- `app/(tabs)/activity.tsx`: Line 22 - Added context string to `console.error`.
- `app/(tabs)/dashboard.tsx`: Line 29 - Added context string to `console.error`.
- `app/(quick_name)/accounts.tsx`: Line 45, 92 - Added context string to `console.error`.
- `src/components/transactionBottomSheet.tsx`: Line 240 - Added context string to `console.error`.
- `src/components/accountBottomSheet.tsx`: Line 118 - Added context string to `console.error`.
- `src/components/transactionDetailsSheet.tsx`: Line 62 - Added context string to `console.error`.

---

### 📋 WHAT TO WATCH NEXT SESSION
- Continue ensuring all new list components use stable keys and avoid `Math.random()` or inline styles.
- Verify that `console.error` consistently includes informative context strings across newly added files.
