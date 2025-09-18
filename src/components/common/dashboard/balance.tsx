import { Card, CardContent } from "@/components/ui/card";
import { BanknoteIcon, ChevronDown, ChevronUp, CurrencyIcon } from "lucide-react";


interface BalanceProps {
  balance: number;
}

export function formatCurrency(amount: number, locale: string = 'pt-BR', currency: string = 'BRL'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function Balance ({ balance }: BalanceProps) {
  
  const balanceColor = balance >= 0 ? 'text-[#A8E6CF]' : 'text-[#FFAAA5]';

  return (
    <Card className="py-4 shadow-none border-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
      <CardContent className="flex w-full items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <h1 className="flex gap-1"><BanknoteIcon className={`h-6 w-6 ${balanceColor}`} /> Seu Saldo</h1>
        <p className={`text-xl font-bold ${balanceColor}`}>{formatCurrency(balance)}</p>
        </div>
      </CardContent>
    </Card>
  );
}