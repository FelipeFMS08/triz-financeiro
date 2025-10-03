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
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { Transaction } from "@/types";

type SortField = "date" | "amount" | "description" | "category";
type SortOrder = "asc" | "desc";
type FilterType = "all" | "income" | "expense";


export default function TransactionsPage() {
  const { transactions, categories, loading, error, refetch, updateTransaction, deleteTransaction } = useMonthNavigator();

  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  
  // Estados para edição e exclusão
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para o formulário de edição
  const [editForm, setEditForm] = useState({
    type: "expense" as "income" | "expense",
    description: "",
    amount: "",
    categoryId: "none", // MUDANÇA: usar "none" ao invés de ""
  });

  // Filtrar e ordenar transações
  const filteredTransactions = useMemo(() => {
    const filtered = transactions.filter((transaction) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!transaction.description.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      if (filterType !== "all" && transaction.type !== filterType) {
        return false;
      }

      if (selectedCategory !== "all") {
        const categoryId = parseInt(selectedCategory);
        if (transaction.categoryId !== categoryId) {
          return false;
        }
      }

      return true;
    });

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

  // Abrir modal de edição
  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditForm({
      type: transaction.type,
      description: transaction.description,
      amount: transaction.amount.toString(),
      categoryId: transaction.categoryId ? transaction.categoryId.toString() : "none", // MUDANÇA
    });
    setShowEditDialog(true);
  };

  // Abrir modal de exclusão
  const handleDeleteClick = (transaction: Transaction) => {
    setDeletingTransaction(transaction);
    setShowDeleteDialog(true);
  };

  // Salvar edição
  const handleSaveEdit = async () => {
    if (!editingTransaction) return;

    if (!editForm.description.trim()) {
      toast.error("Descrição é obrigatória");
      return;
    }

    if (!editForm.amount || parseFloat(editForm.amount) <= 0) {
      toast.error("Valor deve ser maior que zero");
      return;
    }

    setIsSubmitting(true);

    try {
      // MUDANÇA: usar a função do hook
      await updateTransaction(editingTransaction.id, {
        type: editForm.type,
        description: editForm.description,
        amount: parseFloat(editForm.amount),
        categoryId: editForm.categoryId !== "none" ? parseInt(editForm.categoryId) : null,
      });

      toast.success("Transação atualizada com sucesso!");
      setShowEditDialog(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
      toast.error("Não foi possível atualizar a transação");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!deletingTransaction) return;

    setIsSubmitting(true);

    try {
      // MUDANÇA: usar a função do hook
      await deleteTransaction(deletingTransaction.id);

      toast.success("Transação excluída com sucesso!");
      setShowDeleteDialog(false);
      setDeletingTransaction(null);
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      toast.error("Não foi possível excluir a transação");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-800 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
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
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full">
                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
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
          <Card className="my-5 shadow-none bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-600">
            <CardHeader>
              <CardTitle className="text-lg font-normal text-zinc-800 dark:text-white">
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por descrição..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 py-6 dark:bg-zinc-800 dark:border-zinc-600"
                    />
                  </div>
                </div>

                <Select
                  value={filterType}
                  onValueChange={(value: FilterType) => setFilterType(value)}
                >
                  <SelectTrigger className="bg-white dark:bg-zinc-800 dark:text-white text-zinc-800 w-full py-6 shadow-none border-zinc-200 dark:border-zinc-600">
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

                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="bg-white dark:bg-zinc-800 dark:text-white text-zinc-800 w-full py-6 shadow-none border-zinc-200 dark:border-zinc-600">
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto bg-[#FFAAA5] hover:bg-[#ff9995] text-white text-lg font-bold py-6 border-none">
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
              <Card className="border-zinc-100 dark:border-zinc-600">
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold mb-2 dark:text-white">
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
                  className="flex gap-4 items-center shadow-none bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-600"
                >
                  <CardContent className="px-0 w-full">
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
                          <h3 className="font-semibold text-lg dark:text-white">
                            {transaction.description}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs dark:border-zinc-600">
                              {getCategoryName(transaction.categoryId)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(transaction.date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div
                          className={`${
                            transaction.type === "income"
                              ? "text-[#36e0a2]"
                              : "text-[#ff7770]"
                          } font-bold`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="dark:hover:bg-zinc-700">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="dark:bg-zinc-800 dark:border-zinc-600">
                            <DropdownMenuItem onClick={() => handleEditClick(transaction)} className="dark:hover:bg-zinc-700">
                              <Edit3 className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-[#ff7770] dark:hover:bg-zinc-700"
                              onClick={() => handleDeleteClick(transaction)}
                            >
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

      {/* Modal de Edição */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px] dark:bg-zinc-800 dark:border-zinc-600">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-white">
              <Edit3 className="h-5 w-5 text-[#A8E6CF]" />
              Editar Transação
            </DialogTitle>
            <DialogDescription>
              Atualize as informações da transação abaixo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-type" className="dark:text-white">Tipo</Label>
              <Select
                value={editForm.type}
                onValueChange={(value: "income" | "expense") =>
                  setEditForm({ ...editForm, type: value })
                }
              >
                <SelectTrigger id="edit-type" className="w-full dark:bg-zinc-800 dark:border-zinc-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="dark:bg-zinc-800 dark:border-zinc-600">
                  <SelectItem value="income">Entrada</SelectItem>
                  <SelectItem value="expense">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="dark:text-white">Descrição</Label>
              <Input
                id="edit-description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Ex: Salário, Supermercado..."
                className="dark:bg-zinc-800 dark:border-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-amount" className="dark:text-white">Valor (R$)</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm({ ...editForm, amount: e.target.value })
                }
                placeholder="0.00"
                className="dark:bg-zinc-800 dark:border-zinc-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category" className="dark:text-white">Categoria</Label>
              <Select
                value={editForm.categoryId}
                onValueChange={(value) =>
                  setEditForm({ ...editForm, categoryId: value })
                }
              >
                <SelectTrigger id="edit-category" className="dark:bg-zinc-800 dark:border-zinc-600">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="dark:bg-zinc-800 dark:border-zinc-600">
                  <SelectItem value="none">Sem categoria</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isSubmitting}
              className="dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:border-zinc-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSubmitting}
              className="bg-[#A8E6CF] hover:bg-[#8fd9b8] text-zinc-900 font-bold"
            >
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px] dark:bg-zinc-800 dark:border-zinc-600">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#ff7770]">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta transação?
            </DialogDescription>
          </DialogHeader>

          {deletingTransaction && (
            <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-4 space-y-2 border dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Descrição:
                </span>
                <span className="font-semibold dark:text-white">
                  {deletingTransaction.description}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Valor:
                </span>
                <span className={`font-bold ${
                  deletingTransaction.type === "income" 
                    ? "text-[#36e0a2]" 
                    : "text-[#ff7770]"
                }`}>
                  {formatCurrency(deletingTransaction.amount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Categoria:
                </span>
                <span className="text-sm dark:text-white">
                  {getCategoryName(deletingTransaction.categoryId)}
                </span>
              </div>
            </div>
          )}

          <DialogDescription className="text-sm text-gray-600 dark:text-gray-300">
            Esta ação não pode ser desfeita.
          </DialogDescription>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isSubmitting}
              className="dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:border-zinc-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={isSubmitting}
              className="bg-[#ff7770] hover:bg-[#ff5555] text-white font-bold"
            >
              {isSubmitting ? "Excluindo..." : "Confirmar Exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}