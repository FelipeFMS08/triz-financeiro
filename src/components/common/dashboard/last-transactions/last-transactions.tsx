import { Card, CardContent } from "@/components/ui/card";
import type { Transaction } from "@/types";
import { TransactionItem } from "./transaction-item";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface LastTransactionsProps {
  transactions: Transaction[];
  transactionsCount: number;
}

export function LastTransactions({
  transactions,
  transactionsCount,
}: LastTransactionsProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");

  function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(event.target.value.toLowerCase());
  }

  const transactionsFiltered = transactions.filter((transaction) =>
    transaction.description.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-semibold">
        Histórico de Transações ({transactionsCount || 0})
      </h1>
      <div className="relative">
        <SearchIcon className="text-zinc-400 dark:text-zinc-300 absolute top-3.5 left-2" />
        <Input
          type="search"
          placeholder="Pesquise aqui uma transação..."
          className="max-w-sm items-center border border-zinc-200 dark:border-zinc-600 rounded-lg pl-10 py-6 w-full ring-0 focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:border-[#FFAAA5] "
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      {transactionsFiltered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {transactionsFiltered.map((transaction) => (
            <div key={transaction.id}>
              <TransactionItem transaction={transaction} />
            </div>
          ))}
        </div>
      ) : (
        <Card className="py-4 shadow-none border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800">
          <CardContent className="flex w-full items-center justify-center">
            <div className="flex flex-col items-center justify-center">
              <h1 className="flex gap-1 text-zinc-700">
                Não existem transações para este mês.
              </h1>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
