"use client";

import { Category, type Transaction } from "@/types";
import { useCallback, useEffect, useState } from "react";

export interface MonthState {
  year: number;
  month: number;
}

export interface MonthData {
  transactions: Transaction[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
  };
  loading: boolean;
  error: string | null;
}

export interface NewTransactionData {
  type: "income" | "expense";
  description: string;
  amount: string;
  categoryId?: number;
}

export interface UpdateTransactionData {
  type: "income" | "expense";
  description: string;
  amount: number;
  categoryId?: number | null;
}

const STORAGE_KEY = {
  currentMonth: "triz-financeiro-current-month",
  transactionsCache: "triz-financeiro-transactions-cache",
  categoriesCache: "triz-financeiro-categories-cache",
} as const;

export const useMonthNavigator = () => {
  const [isClient, setIsClient] = useState(false);

  const [currentMonth, setCurrentMonth] = useState<MonthState>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });

  const [transactionCache, setTransactionsCache] = useState<
    Record<string, Transaction[]>
  >({});

  const [categories, setCategories] = useState<Category[]>([]);

  // Detect when client mounts
  useEffect(() => {
    setIsClient(true);

    // Load from localStorage only on client
    const savedMonth = localStorage.getItem(STORAGE_KEY.currentMonth);
    if (savedMonth) {
      try {
        setCurrentMonth(JSON.parse(savedMonth));
      } catch (error) {
        console.error("Erro ao recuperar mês salvo:", error);
      }
    }

    const savedTransactions = localStorage.getItem(
      STORAGE_KEY.transactionsCache
    );
    if (savedTransactions) {
      try {
        const parsed = JSON.parse(savedTransactions);
        Object.keys(parsed).forEach((key) => {
          parsed[key] = parsed[key].map((t: any) => ({
            ...t,
            date: new Date(t.date),
            createdAt: t.createdAt ? new Date(t.createdAt) : undefined,
          }));
        });
        setTransactionsCache(parsed);
      } catch (error) {
        console.error("Erro ao recuperar cache de transações:", error);
      }
    }

    const savedCategories = localStorage.getItem(STORAGE_KEY.categoriesCache);
    if (savedCategories) {
      try {
        const parsed = JSON.parse(savedCategories);
        const categoriesWithDates = parsed.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt),
        }));
        setCategories(categoriesWithDates);
      } catch (error) {
        console.error("Erro ao recuperar cache de categorias:", error);
      }
    }
  }, []);

  const [monthDataState, setMonthDataState] = useState<
    Record<string, { loading: boolean; error: string | null }>
  >({});

  const getMonthKey = useCallback((year: number, month: number): string => {
    return `${year}-${month.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(
        STORAGE_KEY.currentMonth,
        JSON.stringify(currentMonth)
      );
    }
  }, [currentMonth, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(
        STORAGE_KEY.transactionsCache,
        JSON.stringify(transactionCache)
      );
    }
  }, [transactionCache, isClient]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(
        STORAGE_KEY.categoriesCache,
        JSON.stringify(categories)
      );
    }
  }, [categories, isClient]);

  const loadCategories = useCallback(async (): Promise<Category[]> => {
    if (categories.length > 0) return categories;

    try {
      const response = await fetch("/api/categories", {
        credentials: "include",
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data: Category[] = await response.json();
      const categoriesWithDates = data.map((c) => ({
        ...c,
        createdAt: new Date(c.createdAt),
      }));

      setCategories(categoriesWithDates);
      return categoriesWithDates;
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      return categories;
    }
  }, [categories]);

  const loadMonthTransactions = useCallback(
    async (year: number, month: number): Promise<Transaction[]> => {
      const monthKey = getMonthKey(year, month);

      if (transactionCache[monthKey]) {
        return transactionCache[monthKey];
      }

      setMonthDataState((prev) => ({
        ...prev,
        [monthKey]: { loading: true, error: null },
      }));

      try {
        const response = await fetch(
          `/api/transactions?year=${year}&month=${month}`
        );

        if (!response.ok)
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        const data: Transaction[] = await response.json();
        const transactionsWithDates = data.map((t) => ({
          ...t,
          date: new Date(t.date),
          createdAt: new Date(t.createdAt),
        }));

        setTransactionsCache((prev) => ({
          ...prev,
          [monthKey]: transactionsWithDates,
        }));

        setMonthDataState((prev) => ({
          ...prev,
          [monthKey]: { loading: false, error: null },
        }));

        return transactionsWithDates;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro desconhecido";

        setMonthDataState((prev) => ({
          ...prev,
          [monthKey]: { loading: false, error: errorMessage },
        }));

        console.error("Erro ao carregar transações:", error);
        return transactionCache[monthKey] || [];
      }
    },
    [getMonthKey, transactionCache]
  );

  const addTransaction = useCallback(
    async (transactionData: NewTransactionData): Promise<Transaction> => {
      const monthKey = getMonthKey(currentMonth.year, currentMonth.month);

      // CORREÇÃO: calcular data correta baseada no mês selecionado
      const today = new Date();
      let transactionDate: Date;

      if (
        currentMonth.year === today.getFullYear() &&
        currentMonth.month === today.getMonth() + 1
      ) {
        // Se está no mês atual, usar data de hoje
        transactionDate = today;
      } else {
        // Se está em outro mês, usar o dia atual nesse mês (ou último dia disponível)
        const lastDayOfSelectedMonth = new Date(
          currentMonth.year,
          currentMonth.month,
          0
        ).getDate();
        const dayToUse = Math.min(today.getDate(), lastDayOfSelectedMonth);
        transactionDate = new Date(
          currentMonth.year,
          currentMonth.month - 1,
          dayToUse
        );
      }

      const tempTransaction: Transaction = {
        id: -Date.now(),
        type: transactionData.type,
        description: transactionData.description,
        amount: parseFloat(transactionData.amount),
        categoryId: transactionData.categoryId,
        userId: "",
        date: transactionDate,
        createdAt: today,
      };

      setTransactionsCache((prev) => ({
        ...prev,
        [monthKey]: [...(prev[monthKey] || []), tempTransaction],
      }));

      try {
        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: transactionData.type,
            description: transactionData.description,
            amount: parseFloat(transactionData.amount),
            categoryId: transactionData.categoryId || null,
            contextYear: currentMonth.year,
            contextMonth: currentMonth.month,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const newTransaction: Transaction = await response.json();
        const transactionWithDate = {
          ...newTransaction,
          date: new Date(newTransaction.date),
          createdAt: new Date(newTransaction.createdAt),
        };

        setTransactionsCache((prev) => ({
          ...prev,
          [monthKey]: prev[monthKey]?.map((t) =>
            t.id === tempTransaction.id ? transactionWithDate : t
          ) || [transactionWithDate],
        }));

        return transactionWithDate;
      } catch (error) {
        setTransactionsCache((prev) => ({
          ...prev,
          [monthKey]:
            prev[monthKey]?.filter((t) => t.id !== tempTransaction.id) || [],
        }));

        throw error;
      }
    },
    [currentMonth, getMonthKey]
  );

  // NOVA FUNÇÃO: Atualizar transação
  const updateTransaction = useCallback(
    async (
      transactionId: number,
      updateData: UpdateTransactionData
    ): Promise<Transaction> => {
      try {
        const response = await fetch(`/api/transactions/${transactionId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const updatedTransaction: Transaction = await response.json();
        const transactionWithDate = {
          ...updatedTransaction,
          date: new Date(updatedTransaction.date),
          createdAt: new Date(updatedTransaction.createdAt),
        };

        // Atualizar o cache - pode estar em qualquer mês
        setTransactionsCache((prev) => {
          const newCache = { ...prev };
          
          // Procurar e atualizar em todos os meses
          Object.keys(newCache).forEach((key) => {
            newCache[key] = newCache[key].map((t) =>
              t.id === transactionId ? transactionWithDate : t
            );
          });

          return newCache;
        });

        return transactionWithDate;
      } catch (error) {
        console.error("Erro ao atualizar transação:", error);
        throw error;
      }
    },
    []
  );

  // NOVA FUNÇÃO: Deletar transação
  const deleteTransaction = useCallback(
    async (transactionId: number): Promise<void> => {
      try {
        const response = await fetch(`/api/transactions/${transactionId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Remover do cache - pode estar em qualquer mês
        setTransactionsCache((prev) => {
          const newCache = { ...prev };
          
          // Remover de todos os meses
          Object.keys(newCache).forEach((key) => {
            newCache[key] = newCache[key].filter((t) => t.id !== transactionId);
          });

          return newCache;
        });
      } catch (error) {
        console.error("Erro ao deletar transação:", error);
        throw error;
      }
    },
    []
  );

  // NOVA FUNÇÃO: Recarregar transações (útil após editar/deletar)
  const refetch = useCallback(async () => {
    const monthKey = getMonthKey(currentMonth.year, currentMonth.month);
    
    // Limpar cache do mês atual
    setTransactionsCache((prev) => {
      const newCache = { ...prev };
      delete newCache[monthKey];
      return newCache;
    });

    // Recarregar
    await loadMonthTransactions(currentMonth.year, currentMonth.month);
  }, [currentMonth, getMonthKey, loadMonthTransactions]);

  const navigateToPreviousMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev.month === 1) {
        return { year: prev.year - 1, month: 12 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  }, []);

  const navigateToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => {
      if (prev.month === 12) {
        return { year: prev.year + 1, month: 1 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  }, []);

  const navigateToMonth = useCallback((year: number, month: number) => {
    setCurrentMonth({ year, month });
  }, []);

  const navigateToCurrentMonth = useCallback(() => {
    const now = new Date();
    setCurrentMonth({ year: now.getFullYear(), month: now.getMonth() + 1 });
  }, []);

  useEffect(() => {
    loadMonthTransactions(currentMonth.year, currentMonth.month);
    loadCategories();
  }, [currentMonth, loadCategories, loadMonthTransactions]);

  const monthKey = getMonthKey(currentMonth.year, currentMonth.month);
  const currentTransactions = transactionCache[monthKey] || [];
  const monthState = monthDataState[monthKey] || {
    loading: false,
    error: null,
  };

  const summary = {
    totalIncome: currentTransactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0),
    totalExpense: currentTransactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0),
    balance: 0,
    transactionCount: currentTransactions.length,
  };
  summary.balance = summary.totalIncome - summary.totalExpense;

  const now = new Date();
  const isCurrentMonth =
    currentMonth.year === now.getFullYear() &&
    currentMonth.month === now.getMonth() + 1;

  const monthInfo = {
    date: new Date(currentMonth.year, currentMonth.month - 1),
    name: isClient
      ? new Date(currentMonth.year, currentMonth.month - 1)
          .toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })
          .split(" ")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ")
      : `${currentMonth.month}/${currentMonth.year}`,
    shortName: isClient
      ? new Date(currentMonth.year, currentMonth.month - 1)
          .toLocaleDateString("pt-BR", {
            month: "short",
            year: "2-digit",
          })
          .split(" ")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ")
      : `${currentMonth.month}/${currentMonth.year.toString().slice(2)}`,
    key: monthKey,
  };

  return {
    currentMonth,
    isCurrentMonth,
    monthInfo,

    transactions: currentTransactions,
    categories,
    summary,

    loading: monthState.loading,
    error: monthState.error,

    navigateToPreviousMonth,
    navigateToNextMonth,
    navigateToMonth,
    navigateToCurrentMonth,

    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch,
    
    loadMonthTransactions,
    loadCategories,

    getMonthKey,
  };
};