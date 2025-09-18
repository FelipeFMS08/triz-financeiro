import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";


interface TransactionsProps {
  entrances: number;
  exits: number;
}

function formatCurrency(amount: number, locale: string = 'pt-BR', currency: string = 'BRL'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function Transactions ({ entrances, exits }: TransactionsProps) {
  return (
    <Card className="py-4 shadow-none border-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
      <CardContent className="flex justify-around">
        <div className="flex flex-col">
          <h1 className="flex gap-1 "><ChevronUp className="h-6 w-6 text-[#A8E6CF]" /> Entradas</h1>
        <p className="text-xl font-bold text-[#A8E6CF]">{formatCurrency(entrances)}</p>
        </div>
        <div className="flex flex-col">
          <h1 className="flex gap-1"><ChevronDown className="h-6 w-6 text-[#FFAAA5]" /> Saidas</h1>
        <p className="text-xl font-bold text-[#FFAAA5]">{formatCurrency(exits)}</p>
        </div>
      </CardContent>
    </Card>
  );
}