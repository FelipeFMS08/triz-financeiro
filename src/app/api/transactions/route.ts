import { db } from "@/db";
import { categories, transactions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { and, desc, eq, gte, lt } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";


export async function GET(request: NextRequest) {
  try {
   const session = await auth.api.getSession({
        headers: await headers()
    })
    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const monthTransactions = await db
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
          eq(transactions.userId, session?.user.id!),
          gte(transactions.date, startDate),
          lt(transactions.date, endDate)
        )
      )
      .orderBy(desc(transactions.date));

      return NextResponse.json(monthTransactions, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return NextResponse.json({ error: 'Internal Server Error', status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    const body = await request.json();
    const { type, description, amount, categoryId, contextYear, contextMonth } = body;

    if (!type || !description || amount === undefined) {
      return NextResponse.json({ 
        error: 'Campos obrigatórios: type, description, amount' 
      }, { status: 400 });
    }

    const today = new Date();
    let transactionDate: Date;

    if (contextYear && contextMonth) {
      if (contextYear === today.getFullYear() && contextMonth === today.getMonth() + 1) {
        // Mesmo mês atual: usar hoje
        transactionDate = today;
      } else {
        // Outro mês: usar dia atual nesse mês
        const lastDayOfMonth = new Date(contextYear, contextMonth, 0).getDate();
        const dayToUse = Math.min(today.getDate(), lastDayOfMonth);
        transactionDate = new Date(contextYear, contextMonth - 1, dayToUse);
      }
    } else {
      // Fallback: usar data atual
      transactionDate = today;
    }


    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json({ 
        error: 'Type deve ser "income" ou "expense"' 
      }, { status: 400 });
    }

    const [newTransaction] = await db
      .insert(transactions)
      .values({
        type: type as 'income' | 'expense',
        description,
        amount: Number(amount),
        categoryId: categoryId || null,
        userId: session?.user.id!, 
        date: transactionDate,
        createdAt: new Date(),
      })
      .returning();

    let categoryName = undefined;
    if (newTransaction.categoryId) {
      const category = await db
        .select({ name: categories.name })
        .from(categories)
        .where(eq(categories.id, newTransaction.categoryId))
        .limit(1);
      
      categoryName = category[0]?.name;
    }

    const response = {
      ...newTransaction,
      categoryName,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
