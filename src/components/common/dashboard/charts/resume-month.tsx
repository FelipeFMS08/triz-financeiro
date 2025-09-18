"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Category, Transaction } from "@/types";

interface ResumeMonthProps {
  transactions: Transaction[];
  categories: Category[];
}

export function ResumeMonth({ transactions, categories }: ResumeMonthProps) {
  const data = categories?.map((categorie) => {
    return {
      name: categorie.name,
      incomes: transactions
        .filter((transaction) => transaction.type === "income" && transaction.categoryId === categorie.id)
        .reduce((acc, transaction) => acc + transaction.amount, 0),
      expenses: transactions
        .filter((transaction) => transaction.type === "expense" && transaction.categoryId === categorie.id)
        .reduce((acc, transaction) => acc + transaction.amount, 0),
    };
  });

  const filteredData = data.filter(d => d.incomes > 0 || d.expenses > 0);

  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-semibold">Gastos por Categoria</h1>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart accessibilityLayer data={filteredData}>
            <XAxis
              dataKey="name"
              tickLine={false}
              interval={0}
              tick={({ x, y, payload }) => {
                const name = payload.value;
                const truncated =
                  name.length > 5 ? name.slice(0, 5) + "…" : name;
                return (
                  <text
                  className="text-zinc-700 dark:text-zinc-200"
                    x={x}
                    y={y + 10}
                    textAnchor="middle"
                    fill="#333"
                    fontSize={12}
                  >
                    {truncated}
                  </text>
                );
              }}
              axisLine={false}
            />
            <Bar
              dataKey="incomes"
              stackId="a"
              fill="#86efac"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="expenses"
              stackId="a"
              fill="#fca5a5"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div>Carregando</div>
      )}
    </div>
  );
}
