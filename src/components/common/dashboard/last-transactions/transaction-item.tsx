import type { Transaction } from "@/types";
import { getIcon } from "../categories/categories";
import { formatCurrency } from "../balance";

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  return (
    <div className="flex gap-4 items-center">
      <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-[#A8E6CF] text-[#36e0a2]' : 'bg-[#FFAAA5] text-[#ff7770]'}`}>
        {getIcon(transaction.categoryId!)}
      </div>
      <div className="flex flex-col">
        <h3 className="font-semibold text-md truncate w-20">{transaction.description}</h3>
        <span className="text-sm text-zinc-700 dark:text-zinc-300">{transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: "2-digit",
          minute: "2-digit"
        }) : transaction.date.toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: "2-digit",
          minute: "2-digit"
        })}</span>
      </div>
      <div className={`${transaction.type === 'income' ? 'text-[#36e0a2]' : 'text-[#ff7770]'} font-bold`}>
        {transaction.type === 'income' ? <span>+</span> : <span>-</span> }{formatCurrency(transaction.amount)}
      </div>
    </div>
  )

}