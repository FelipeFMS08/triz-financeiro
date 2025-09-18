"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Settings,
  Palette,
  Bell,
  Shield,
  Download,
  Upload,
  Trash2,
  Plus,
  Edit3,
  Moon,
  Sun,
  Lock,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/ui/motion-tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { getIcon } from "@/components/common/dashboard/categories/categories";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { CloudinaryUpload } from "@/components/ui/cloudinary-upload";

interface Category {
  id: number;
  name: string;
  threshold: number | null;
  color: string;
  createdAt: Date;
}

interface UserSettings {
  darkMode: boolean;
  currency: string;
  dateFormat: string;
  notifications: boolean;
  budgetAlerts: boolean;
  weeklyReport: boolean;
}

type User = {
  name?: string;
  email?: string;
  image?: string;
};

export default function SettingsPage() {
  const { setTheme, theme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Estados dos dados
  const [user, setUser] = useState<User>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    darkMode: false,
    currency: "BRL",
    dateFormat: "dd/mm/yyyy",
    notifications: true,
    budgetAlerts: true,
    weeklyReport: false,
  });

  // Estados dos modais
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [showEditCategoryDialog, setShowEditCategoryDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [newCategory, setNewCategory] = useState({
    name: "",
    threshold: "",
    color: "#FF6B6B",
  });

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  // Estados da aba de segurança
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadUserData();
    loadCategories();
    loadSettings();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const userData = await response.json();
        await setUser(userData);
        console.log(user);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const categoriesData = await response.json();
        // Adicionar cores padrão baseadas no ID
        const categoriesWithColors = categoriesData.map((cat: any) => ({
          ...cat,
          color: getCategoryColor(cat.name),
        }));
        setCategories(categoriesWithColors);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/user/settings");
      if (response.ok) {
        const settingsData = await response.json();
        setSettings(settingsData);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  };

  const getCategoryColor = (name: string): string => {
    const colors: Record<string, string> = {
      Mercado: "#FF6B6B",
      Necessidades: "#4ECDC4",
      Eletronicos: "#45B7D1",
      Assinaturas: "#96CEB4",
      Roupa: "#FECA57",
      Beleza: "#A29BFE",
      Presentes: "#FD79A8",
      Saúde: "#FF8A80",
      "Despesas Eventuais": "#FDCB6E",
      Desenvolvimento: "#81C784",
      "Uber ou Transporte": "#64B5F6",
      "IFood ou Restaurante": "#FFB74D",
      Lazer: "#BA68C8",
      Aluguel: "#4DB6AC",
      Contas: "#F06292",
    };
    return colors[name] || "#9CA3AF";
  };

  // Handlers para perfil
  const handleProfileUpdate = async () => {
    setLoading(true);
    console.log(user);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        toast.success("Suas informações foram salvas com sucesso.");
      } else {
        throw new Error("Erro ao atualizar perfil");
      }
    } catch (error) {
      toast.error("Não foi possível atualizar o perfil.");
    } finally {
      setLoading(false);
    }
  };

  // Handlers para categorias
  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("Nome da categoria é obrigatório.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategory.name,
          threshold: newCategory.threshold
            ? Number(newCategory.threshold)
            : null,
        }),
      });

      if (response.ok) {
        const createdCategory = await response.json();
        setCategories([
          ...categories,
          {
            ...createdCategory,
            color: getCategoryColor(createdCategory.name),
          },
        ]);
        setNewCategory({ name: "", threshold: "", color: "#FF6B6B" });
        setShowNewCategoryDialog(false);
        toast.success("Nova categoria adicionada com sucesso.");
      } else {
        throw new Error("Erro ao criar categoria");
      }
    } catch (error) {
      toast("Não foi possível criar a categoria.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingCategory.name,
          threshold: editingCategory.threshold,
        }),
      });

      if (response.ok) {
        setCategories(
          categories.map((cat) =>
            cat.id === editingCategory.id
              ? {
                  ...editingCategory,
                  color: getCategoryColor(editingCategory.name),
                }
              : cat
          )
        );
        setEditingCategory(null);
        setShowEditCategoryDialog(false);
        toast.success("Categoria editada com sucesso.");
      } else {
        throw new Error("Erro ao editar categoria");
      }
    } catch (error) {
      toast.error("Não foi possível editar a categoria.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCategories(
          categories.filter((cat) => cat.id !== categoryToDelete.id)
        );
        setCategoryToDelete(null);
        setShowDeleteDialog(false);
        toast.success("Categoria excluída com sucesso.");
      } else {
        throw new Error("Erro ao deletar categoria");
      }
    } catch (error) {
      toast.error("Não foi possível excluir a categoria.");
    } finally {
      setLoading(false);
    }
  };

  // Handlers para configurações
  const handleSettingsUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success("Suas preferências foram atualizadas.");
      } else {
        throw new Error("Erro ao salvar configurações");
      }
    } catch (error) {
      toast.error("Não foi possível salvar as configurações.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUploaded = async (imageUrl: string) => {
    const updatedUser = { ...user, image: imageUrl };
    setUser(updatedUser);

    // Salvar automaticamente no banco
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar foto no perfil");
      }
    } catch (error) {
      toast.error("Foto enviada, mas erro ao salvar no perfil.");
    }
  };

  // Handler para alterar senha
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        toast.success("Sua senha foi atualizada com sucesso.");
      } else {
        throw new Error("Erro ao alterar senha");
      }
    } catch (error) {
      toast.error("Não foi possível alterar a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-zinc-800">
        <div className="bg-white dark:bg-zinc-800 ">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex flex-col items-center justify-between mb-2">
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Configurações
              </h1>
              <p className="text-zinc-600 dark:text-white text-sm mt-2">
                Gerencie suas preferências e configurações da conta
              </p>
              <div className="w-9" />
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto space-y-6">
          <Tabs defaultValue="profile" className="">
            <TabsList className="flex w-full px-5 bg-gray-100 rounded-none dark:text-white dark:bg-zinc-900 border-t border-t-zinc-100 dark:border-t-zinc-600">
              <TabsTrigger
                value="profile"
                className="dark:data-[state=active]:bg-zinc-800 shadow-none"
              >
                Perfil
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="dark:data-[state=active]:bg-zinc-800 shadow-none"
              >
                Categorias
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                className="dark:data-[state=active]:bg-zinc-800 shadow-none"
              >
                Preferências
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="dark:data-[state=active]:bg-zinc-800 shadow-none"
              >
                Segurança
              </TabsTrigger>
            </TabsList>
            <TabsContents>
              <TabsContent value="profile">
                {user && (
                  <Card className="bg-white dark:bg-zinc-800 rounded-none mt-2 border-none">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informações Pessoais
                      </CardTitle>
                      <CardDescription>
                        Atualize suas informações pessoais e foto de perfil
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <CloudinaryUpload
                        currentImage={user.image}
                        onImageUploaded={handleImageUploaded}
                        userId={user.name || "User"}
                      />

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome Completo</Label>
                          <Input
                            className="w-full py-6 focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:border-[#A8E6CF]"
                            id="name"
                            value={user.name}
                            onChange={(e) =>
                              setUser({ ...user, name: e.target.value })
                            }
                            placeholder="Seu nome completo"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            className="w-full py-6 focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:border-[#A8E6CF]"
                            id="email"
                            type="email"
                            value={user.email}
                            onChange={(e) =>
                              setUser({ ...user, email: e.target.value })
                            }
                            placeholder="seu@email.com"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleProfileUpdate}
                        disabled={loading}
                        className="w-full py-6 bg-[#A8E6CF] font-bold text-zinc-900 text-lg"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "Salvando..." : "Salvar Alterações"}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Aba Categorias */}
              <TabsContent value="categories" className="">
                <Card className="bg-white dark:bg-zinc-800 rounded-none mt-2 border-none">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Gerenciar Categorias
                      </div>

                      <Button
                        size="default"
                        onClick={() => setShowNewCategoryDialog(true)}
                        className="bg-[#FFAAA5] hover:bg-[#ffcecc] text-gray-900"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Categoria
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Configure suas categorias de gastos e limites mensais
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <Card
                          key={category.id}
                          className="shadow-none bg-white dark:bg-zinc-800"
                        >
                          <CardContent className="px-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="text-lg">
                                  <div className="text-[#FFAAA5] flex flex-col items-center gap-1 w-20">
                                    <div className="bg-[#FADADD] p-4 rounded-lg">
                                      {getIcon(category.id)}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-semibold">
                                    {category.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {category.threshold
                                      ? `Limite: R$ ${category.threshold.toLocaleString(
                                          "pt-BR"
                                        )}`
                                      : "Sem limite definido"}
                                  </p>
                                </div>
                              </div>

                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingCategory(category);
                                    setShowEditCategoryDialog(true);
                                  }}
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    setCategoryToDelete(category);
                                    setShowDeleteDialog(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {categories.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Nenhuma categoria encontrada.</p>
                          <p className="text-sm">
                            Crie sua primeira categoria para começar.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Preferências */}
              <TabsContent value="preferences" className="">
                <Card className="bg-white dark:bg-zinc-800 rounded-none mt-2 border-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Aparência e Comportamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Modo Escuro</Label>
                        <p className="text-sm text-muted-foreground">
                          Alterar entre tema claro e escuro
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Sun className="h-4 w-4" />
                        <Switch
                          checked={theme === "dark" ? true : false}
                          onCheckedChange={(checked) => {
                            setSettings({ ...settings, darkMode: checked });
                            setTheme(checked ? "dark" : "light");
                          }}
                        />
                        <Moon className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Segurança */}
              <TabsContent value="security" className="">
                <Card className="bg-white dark:bg-zinc-800 rounded-none mt-2 border-none">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Alterar Senha
                    </CardTitle>
                    <CardDescription>
                      Mantenha sua conta segura com uma senha forte
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Senha Atual</Label>
                      <div className="relative">
                        <Input
                          className="w-full py-6 focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:border-[#A8E6CF]"
                          id="currentPassword"
                          type={showPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          placeholder="Digite sua senha atual"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <Input
                        className="w-full py-6 focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:border-[#A8E6CF]"
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder="Digite a nova senha"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirmar Nova Senha
                      </Label>
                      <Input
                        className="w-full py-6 focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:border-[#A8E6CF]"
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Confirme a nova senha"
                      />
                    </div>

                    <Button
                      onClick={handlePasswordChange}
                      disabled={
                        loading ||
                        !passwordData.currentPassword ||
                        !passwordData.newPassword ||
                        !passwordData.confirmPassword
                      }
                      className="w-full py-6 bg-[#A8E6CF] font-bold text-zinc-900 text-lg"
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      {loading ? "Alterando..." : "Alterar Senha"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </TabsContents>

            {/* Aba Perfil */}
          </Tabs>

          {/* Modal Nova Categoria */}
          <Dialog
            open={showNewCategoryDialog}
            onOpenChange={setShowNewCategoryDialog}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Categoria</DialogTitle>
                <DialogDescription>
                  Defina um nome e limite de gastos para a categoria
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Nome da Categoria</Label>
                  <Input
                    id="categoryName"
                    placeholder="Ex: Alimentação"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryThreshold">
                    Limite Mensal (R$) - Opcional
                  </Label>
                  <Input
                    id="categoryThreshold"
                    type="number"
                    placeholder="800"
                    value={newCategory.threshold}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        threshold: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowNewCategoryDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateCategory}
                  disabled={loading}
                  className="bg-[#A8E6CF] hover:bg-[#8fd9b8] text-gray-900"
                >
                  {loading ? "Criando..." : "Criar Categoria"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal Editar Categoria */}
          <Dialog
            open={showEditCategoryDialog}
            onOpenChange={setShowEditCategoryDialog}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Categoria</DialogTitle>
                <DialogDescription>
                  Altere o nome ou limite da categoria
                </DialogDescription>
              </DialogHeader>
              {editingCategory && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="editCategoryName">Nome da Categoria</Label>
                    <Input
                      id="editCategoryName"
                      value={editingCategory.name}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editCategoryThreshold">
                      Limite Mensal (R$) - Opcional
                    </Label>
                    <Input
                      id="editCategoryThreshold"
                      type="number"
                      value={editingCategory.threshold?.toString() || ""}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          threshold: e.target.value
                            ? Number(e.target.value)
                            : null,
                        })
                      }
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowEditCategoryDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleEditCategory}
                  disabled={loading}
                  className="bg-[#A8E6CF] hover:bg-[#8fd9b8] text-gray-900"
                >
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal Confirmar Exclusão */}
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Confirmar Exclusão
                </DialogTitle>
                <DialogDescription>
                  Tem certeza de que deseja excluir a categoria "
                  {categoryToDelete?.name}"? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteCategory}
                  disabled={loading}
                >
                  {loading ? "Excluindo..." : "Excluir Categoria"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}
