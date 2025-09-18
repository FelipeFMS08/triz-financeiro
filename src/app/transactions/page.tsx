"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Calendar,
  TrendingUp,
  TrendingDown,
  Edit3,
  Trash2,
  ChevronDown,
  Plus,
  ArrowUpDown,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useMonthNavigator } from "@/hooks/use-month-navigator";
import { Transactions } from "@/components/common/dashboard/transactions";
import { Balance } from "@/components/common/dashboard/balance";
import { getIcon } from "@/components/common/dashboard/categories/categories";
import { SelectGroup, SelectLabel } from "@radix-ui/react-select";

type SortField = "date" | "amount" | "description" | "category";
type SortOrder = "asc" | "desc";
type FilterType = "all" | "income" | "expense";

export default function TransactionsPage() {
  const { transactions, categories, loading, error } = useMonthNavigator();

  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Filtrar e ordenar transações
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter((transaction) => {
      // Filtro por busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!transaction.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Filtro por tipo
      if (filterType !== "all" && transaction.type !== filterType) {
        return false;
      }

      // Filtro por categoria
      if (selectedCategory !== "all") {
        const categoryId = parseInt(selectedCategory);
        if (transaction.categoryId !== categoryId) {
          return false;
        }
      }

      return true;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "date":
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "description":
          comparison = a.description.localeCompare(b.description);
          break;
        case "category":
          const aCat =
            categories.find((c) => c.id === a.categoryId)?.name ||
            "Sem categoria";
          const bCat =
            categories.find((c) => c.id === b.categoryId)?.name ||
            "Sem categoria";
          comparison = aCat.localeCompare(bCat);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [
    transactions,
    searchTerm,
    filterType,
    selectedCategory,
    sortField,
    sortOrder,
    categories,
  ]);

  // Estatísticas das transações filtradas
  const stats = useMemo(() => {
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      total: filteredTransactions.length,
      income,
      expense,
      balance: income - expense,
    };
  }, [filteredTransactions]);

  const getCategoryName = (categoryId: number | null | undefined) => {
    if (!categoryId) return "Sem categoria";
    return (
      categories.find((c) => c.id === categoryId)?.name ||
      "Categoria desconhecida"
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-zinc-800 border-b border-b-zinc-100 dark:border-b-zinc-600">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Transações
              </h1>
              <div className="w-9" />
            </div>
          </div>
        </div>
        <div className="min-h-screen bg-white dark:bg-zinc-800 px-4 sm:px-6 lg:px-8">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Balance balance={stats.balance} />
            <Transactions entrances={stats.income} exits={stats.expense} />
            <Card className="py-4 shadow-none border-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200">
              <CardContent className="flex flex-col w-full items-center justify-center">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <div className="text-2xl font-bold text-[#A8E6CF]">
                  {stats.total}
                </div>
                <p className="text-xs text-muted-foreground">transações</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros e Busca */}
          <Card className="my-5 shadow-none bg-white dark:bg-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg font-normal text-zinc-800 dark:text-white">
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Busca */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por descrição..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 py-6"
                    />
                  </div>
                </div>

                {/* Filtro por tipo */}
                <Select
                  value={filterType}
                  onValueChange={(value: FilterType) => setFilterType(value)}
                >
                  <SelectTrigger className="bg-white dark:bg-zinc-800 dark:text-white text-zinc-800 w-full py-6 shadow-none">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup className="[&_div:focus]:bg-[#A8E6CF] [&_div:focus]:text-white px-2">
                      <SelectLabel className="text-sm py-2">Tipo</SelectLabel>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="income">Entradas</SelectItem>
                      <SelectItem value="expense">Saídas</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {/* Filtro por categoria */}
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="bg-white dark:bg-zinc-800 dark:text-white text-zinc-800 w-full py-6 shadow-none">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup className="[&_div:focus]:bg-[#FFAAA5] [&_div:focus]:text-white px-2">
                      <SelectLabel className="text-sm py-2">
                        Categoria
                      </SelectLabel>
                      <SelectItem value="all">Todas</SelectItem>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {/* Ordenação */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto bg-[#FFAAA5] text-white text-lg font-bold py-6">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      Ordenar
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-82">
                    <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSortField("date")}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Data
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortField("amount")}>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Valor
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSortField("description")}
                    >
                      Descrição
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortField("category")}>
                      Categoria
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                    >
                      {sortOrder === "asc" ? "Decrescente" : "Crescente"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Transações */}
          <div className="space-y-2 bg-white dark:bg-zinc-800">
            {filteredTransactions.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold mb-2">
                    Nenhuma transação encontrada
                  </h3>
                  <p className="text-muted-foreground">
                    Tente ajustar os filtros ou adicione uma nova transação
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredTransactions.map((transaction) => (
                <Card
                  key={transaction.id}
                  className="flex gap-4 items-center shadow-none bg-white dark:bg-zinc-800"
                >
                  <CardContent className="px-0">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === "income"
                              ? "bg-[#A8E6CF] text-[#36e0a2]"
                              : "bg-[#FFAAA5] text-[#ff7770]"
                          }`}
                        >
                          {getIcon(transaction.categoryId!)}
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg">
                            {transaction.description}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getCategoryName(transaction.categoryId)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(transaction.date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div
                          className={`${
                            transaction.type === "income"
                              ? "text-[#36e0a2]"
                              : "text-[#ff7770]"
                          } font-bold`}
                        >
                          {transaction.type === "income" ? (
                            <span>+</span>
                          ) : (
                            <span>-</span>
                          )}
                          {formatCurrency(transaction.amount)}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-[#ff7770]">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
