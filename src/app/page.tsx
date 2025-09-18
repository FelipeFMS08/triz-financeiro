"use client";

import { AddButton } from "@/components/common/add-transaction/add-transaction";
import { Balance } from "@/components/common/dashboard/balance";
import { Categories } from "@/components/common/dashboard/categories/categories";
import { ResumeMonth } from "@/components/common/dashboard/charts/resume-month";
import { FeedbackPopup } from "@/components/common/dashboard/feedback-popup";
import { LastTransactions } from "@/components/common/dashboard/last-transactions/last-transactions";
import { MonthNavigation } from "@/components/common/dashboard/month-navigation";
import { Transactions } from "@/components/common/dashboard/transactions";
import { NavigationBar } from "@/components/common/navigation-bar";
import { PageWrapper } from "@/components/page-wrapper";
import { Button } from "@/components/ui/button";
import {
  useMonthNavigator,
  type NewTransactionData,
} from "@/hooks/use-month-navigator";
import { useEffect, useState } from "react";

export default function Home() {
  const {
    currentMonth,
    isCurrentMonth,
    monthInfo,
    transactions,
    categories,
    summary,
    loading,
    error,
    navigateToPreviousMonth,
    navigateToNextMonth,
    navigateToCurrentMonth,
    navigateToMonth,
    addTransaction,
  } = useMonthNavigator();

  const [submitting, setSubmitting] = useState(false);

  const handleAddTransaction = async (data: NewTransactionData) => {
    setSubmitting(true);

    try {
      await addTransaction(data);
    } catch (error) {
      console.error("Erro ao adicionar transação:", error);
      alert("Erro ao adicionar transação. Por favor, tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <MonthNavigation
        month={monthInfo.name}
        onNextMonth={navigateToNextMonth}
        onPreviousMonth={navigateToPreviousMonth}
      />
      <main className="flex flex-col px-4 sm:px-6 lg:px-8 max-w-full gap-4 mt-16">
        <Balance balance={summary.balance} />
        <Transactions
          entrances={summary.totalIncome}
          exits={summary.totalExpense}
        />

        <FeedbackPopup
          entrances={summary.totalIncome}
          exits={summary.totalExpense}
        />
        <Categories categories={categories} />
        {categories.length > 0 && (
          <ResumeMonth transactions={transactions} categories={categories} />
        )}

        <LastTransactions
          transactions={transactions.toReversed()}
          transactionsCount={summary.transactionCount}
        />
      </main>
      <AddButton
        categories={categories}
        setIsSubmitting={setSubmitting}
        isSubmitting={submitting}
        onAdd={handleAddTransaction}
      />
    </PageWrapper>
  );
}
