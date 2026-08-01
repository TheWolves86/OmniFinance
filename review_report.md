## JULES REVIEW REPORT
Date: 2026-07-31
Project: OmniFinance
Files Reviewed: 12

---

### 🔴 CRITICAL SECURITY ISSUES (1)
File: src/lib/storage.ts
Line: 13, 25, 38
Issue: The raw error object in `saveItem`, `getItem`, and `removeItem` is logged directly via `console.error`.
Why it's dangerous: Logging raw error objects in the context of storage operations could accidentally leak sensitive tokens, such as the Gemini API key, into terminal output or logging services.
Fix:
<<<<<<< SEARCH
export async function saveItem(key: string, value: string) {
    try {
        if (key === STORAGE_KEYS.API_KEY) {
            await SecureStore.setItemAsync(key, value);
        } else {
            await AsyncStorage.setItem(key, value);
        }
    } catch (error) {
        console.error("Error saving item to storage:", error);
        throw error;
    }
}

export async function getItem(key: string) {
    try {
        if (key === STORAGE_KEYS.API_KEY) {
            return await SecureStore.getItemAsync(key);
        }
        return await AsyncStorage.getItem(key);
    } catch (error) {
        console.error("Error getting item from storage:", error);
        throw error;
    }
}

export async function removeItem(key: string) {
    try {
        if (key === STORAGE_KEYS.API_KEY) {
            await SecureStore.deleteItemAsync(key);
        } else {
            await AsyncStorage.removeItem(key);
        }
    } catch (error) {
        console.error("Error removing item from storage:", error);
        throw error;
    }
}
=======
export async function saveItem(key: string, value: string) {
    try {
        if (key === STORAGE_KEYS.API_KEY) {
            await SecureStore.setItemAsync(key, value);
        } else {
            await AsyncStorage.setItem(key, value);
        }
    } catch (error) {
        console.error("Error saving item to storage");
        throw error;
    }
}

export async function getItem(key: string) {
    try {
        if (key === STORAGE_KEYS.API_KEY) {
            return await SecureStore.getItemAsync(key);
        }
        return await AsyncStorage.getItem(key);
    } catch (error) {
        console.error("Error getting item from storage");
        throw error;
    }
}

export async function removeItem(key: string) {
    try {
        if (key === STORAGE_KEYS.API_KEY) {
            await SecureStore.deleteItemAsync(key);
        } else {
            await AsyncStorage.removeItem(key);
        }
    } catch (error) {
        console.error("Error removing item from storage");
        throw error;
    }
}
>>>>>>> REPLACE

---

### 🟠 BUGS & ERROR HANDLING (0)
None found this session. The code adequately wraps database transactions and file modifications in `try/catch` and gracefully defaults data properties using optional chaining operators.

---

### 🟡 PERFORMANCE ISSUES (2)
File: app/(quick_name)/accounts.tsx
Line: 25, 77
Issue: Missing `useMemo` for array filtering operations and `getItemLayout` for the `FlatList`.
Why it's dangerous: Running `filter` on every single render triggers recalculations leading to UI stuttering as the application scales. Unoptimized lists hurt scrolling frame rates significantly.
Fix:
<<<<<<< SEARCH
  const filteredAccounts = accounts.filter((account) => account.name.toLowerCase().includes(search.toLowerCase()))

  const renderHeader = () => (
=======
  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => account.name.toLowerCase().includes(search.toLowerCase()))
  }, [accounts, search])

  const renderHeader = () => (
>>>>>>> REPLACE

<<<<<<< SEARCH
        contentContainerStyle={styles.listContent}
        renderItem={({item}) => (
=======
        contentContainerStyle={styles.listContent}
        getItemLayout={(data, index) => ({
          length: 73, // Height of account card based on styling (approx)
          offset: 73 * index,
          index,
        })}
        renderItem={({item}) => (
>>>>>>> REPLACE

File: app/(tabs)/activity.tsx
Line: 37
Issue: Lack of `useMemo` caching on the array transformations.
Why it's dangerous: Sorting, reducing, grouping, and filtering array data causes expensive calculations every time React re-evaluates the view, reducing frame rate.
Fix:
<<<<<<< SEARCH
  const normalizedSearch = search.trim().toLowerCase();
  const filteredTransactions = transactions.filter((item) => {
    const displayTitle = item?.title?.trim() ? item.title : item?.categoryName || "";
    return displayTitle.toLowerCase().includes(normalizedSearch);
  });

  const grouped = filteredTransactions.reduce((acc: any[], item: any) => {
    const date = new Date(item?.transactionDate ?? Date.now());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const transactionDay = new Date(date);
    transactionDay.setHours(0, 0, 0, 0);

    let sectionTitle = transactionDay.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    let sectionOrder = 2;

    if (transactionDay.getTime() === today.getTime()) {
      sectionTitle = "TODAY";
      sectionOrder = 0;
    } else if (transactionDay.getTime() === yesterday.getTime()) {
      sectionTitle = "YESTERDAY";
      sectionOrder = 1;
    }

    const existing = acc.find((section: any) => section.title === sectionTitle);
    if (existing) {
      existing.data.push(item);
    } else {
      acc.push({
        title: sectionTitle,
        data: [item],
        order: sectionOrder,
      });
    }

    return acc;
  }, []);

  const sortedGroups = grouped.sort((a, b) => a.order - b.order);
=======
  const sortedGroups = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const filteredTransactions = transactions.filter((item) => {
      const displayTitle = item?.title?.trim() ? item.title : item?.categoryName || "";
      return displayTitle.toLowerCase().includes(normalizedSearch);
    });

    const grouped = filteredTransactions.reduce((acc: any[], item: any) => {
      const date = new Date(item?.transactionDate ?? Date.now());

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const transactionDay = new Date(date);
      transactionDay.setHours(0, 0, 0, 0);

      let sectionTitle = transactionDay.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      let sectionOrder = 2;

      if (transactionDay.getTime() === today.getTime()) {
        sectionTitle = "TODAY";
        sectionOrder = 0;
      } else if (transactionDay.getTime() === yesterday.getTime()) {
        sectionTitle = "YESTERDAY";
        sectionOrder = 1;
      }

      const existing = acc.find((section: any) => section.title === sectionTitle);
      if (existing) {
        existing.data.push(item);
      } else {
        acc.push({
          title: sectionTitle,
          data: [item],
          order: sectionOrder,
        });
      }

      return acc;
    }, []);

    return grouped.sort((a: any, b: any) => a.order - b.order);
  }, [transactions, search]);
>>>>>>> REPLACE


---

### 🔵 CODE QUALITY (0)
None found this session.

---

### ✅ FIXES APPLIED
- `src/lib/storage.ts`: Removed raw error logging which risked data leaks (line 13, 25, 38).
- `app/(quick_name)/accounts.tsx`: Applied `useMemo` for filtering list data and implemented `getItemLayout` for smoother scrolling rendering (line 25, 77).
- `app/(tabs)/activity.tsx`: Wrapped heavily computational properties that construct groups array inside `useMemo` to improve render times (line 37).

---

### 📋 WHAT TO WATCH NEXT SESSION
- Consider reviewing API configurations and cache times if the Gemini implementation progresses further.
- Verify any newly added raw SQLite string usages to ensure variables use interpolation strictly via parameterized values.
