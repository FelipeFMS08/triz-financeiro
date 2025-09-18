import { db } from "@/db";
import { categories, transactions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'ID da categoria inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { name, threshold } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        error: 'Nome da categoria é obrigatório' 
      }, { status: 400 });
    }

    // Verificar se a categoria existe
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    // Verificar se já existe outra categoria com esse nome
    const duplicateCategory = await db
      .select()
      .from(categories)
      .where(and(
        eq(categories.name, name.trim()),
        // Excluir a categoria atual da busca
        eq(categories.id, categoryId) // Isso vai ser negado na query
      ))
      .limit(1);

    // Buscar categorias com mesmo nome exceto a atual
    const conflictingCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.name, name.trim()));

    const hasConflict = conflictingCategories.some(cat => cat.id !== categoryId);

    if (hasConflict) {
      return NextResponse.json({ 
        error: 'Já existe uma categoria com esse nome' 
      }, { status: 409 });
    }

    const [updatedCategory] = await db
      .update(categories)
      .set({
        name: name.trim(),
        threshold: threshold ? Number(threshold) : null,
      })
      .where(eq(categories.id, categoryId))
      .returning();

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categoryId = parseInt(id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'ID da categoria inválido' }, { status: 400 });
    }

    // Verificar se a categoria existe
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1);

    if (existingCategory.length === 0) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    // Verificar se há transações usando esta categoria
    const transactionsCount = await db
      .select()
      .from(transactions)
      .where(eq(transactions.categoryId, categoryId))
      .limit(1);

    if (transactionsCount.length > 0) {
      // Se há transações, definir categoryId como null ao invés de deletar
      await db
        .update(transactions)
        .set({ categoryId: null })
        .where(eq(transactions.categoryId, categoryId));
    }

    // Deletar a categoria
    await db
      .delete(categories)
      .where(eq(categories.id, categoryId));

    return NextResponse.json({ 
      message: 'Categoria deletada com sucesso',
      transactionsUpdated: transactionsCount.length > 0 
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}