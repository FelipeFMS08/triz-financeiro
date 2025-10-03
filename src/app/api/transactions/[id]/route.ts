import { db } from "@/db";
import { categories, transactions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT - Atualizar transação
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const transactionId = parseInt(id);

    if (isNaN(transactionId)) {
      return NextResponse.json({ 
        error: 'ID da transação inválido' 
      }, { status: 400 });
    }

    const body = await request.json();
    const { type, description, amount, categoryId } = body;

    // Validações
    if (!type || !['income', 'expense'].includes(type)) {
      return NextResponse.json({ 
        error: 'Tipo deve ser "income" ou "expense"' 
      }, { status: 400 });
    }

    if (!description || description.trim() === '') {
      return NextResponse.json({ 
        error: 'Descrição é obrigatória' 
      }, { status: 400 });
    }

    if (amount === undefined || amount <= 0) {
      return NextResponse.json({ 
        error: 'Valor deve ser maior que zero' 
      }, { status: 400 });
    }

    // Verificar se a transação existe e pertence ao usuário
    const existingTransaction = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingTransaction.length === 0) {
      return NextResponse.json({ 
        error: 'Transação não encontrada' 
      }, { status: 404 });
    }

    // Atualizar a transação
    const [updatedTransaction] = await db
      .update(transactions)
      .set({
        type: type as 'income' | 'expense',
        description: description.trim(),
        amount: Number(amount),
        categoryId: categoryId || null,
      })
      .where(eq(transactions.id, transactionId))
      .returning();

    // Buscar o nome da categoria se existir
    let categoryName = undefined;
    if (updatedTransaction.categoryId) {
      const category = await db
        .select({ name: categories.name })
        .from(categories)
        .where(eq(categories.id, updatedTransaction.categoryId))
        .limit(1);
      
      categoryName = category[0]?.name;
    }

    const response = {
      ...updatedTransaction,
      categoryName,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error' 
    }, { status: 500 });
  }
}

// DELETE - Excluir transação
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const transactionId = parseInt(id);

    if (isNaN(transactionId)) {
      return NextResponse.json({ 
        error: 'ID da transação inválido' 
      }, { status: 400 });
    }

    // Verificar se a transação existe e pertence ao usuário
    const existingTransaction = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, session.user.id)
        )
      )
      .limit(1);

    if (existingTransaction.length === 0) {
      return NextResponse.json({ 
        error: 'Transação não encontrada' 
      }, { status: 404 });
    }

    // Deletar a transação
    await db
      .delete(transactions)
      .where(eq(transactions.id, transactionId));

    return NextResponse.json({ 
      message: 'Transação deletada com sucesso',
      id: transactionId
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error' 
    }, { status: 500 });
  }
}

// GET - Buscar transação específica (opcional, mas útil)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const transactionId = parseInt(id);

    if (isNaN(transactionId)) {
      return NextResponse.json({ 
        error: 'ID da transação inválido' 
      }, { status: 400 });
    }

    const [transaction] = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        description: transactions.description,
        amount: transactions.amount,
        categoryId: transactions.categoryId,
        categoryName: categories.name,
        userId: transactions.userId,
        date: transactions.date,
        createdAt: transactions.createdAt
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.id, transactionId),
          eq(transactions.userId, session.user.id)
        )
      )
      .limit(1);

    if (!transaction) {
      return NextResponse.json({ 
        error: 'Transação não encontrada' 
      }, { status: 404 });
    }

    return NextResponse.json(transaction, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar transação:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error' 
    }, { status: 500 });
  }
}