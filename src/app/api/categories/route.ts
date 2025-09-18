import { db } from "@/db";
import { categories } from "@/db/schema";
import { auth } from "@/lib/auth";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        threshold: categories.threshold,
        createdAt: categories.createdAt
      })
      .from(categories)
      .orderBy(desc(categories.createdAt));

    return NextResponse.json(allCategories, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, threshold } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        error: 'Nome da categoria é obrigatório' 
      }, { status: 400 });
    }

    // Verificar se já existe uma categoria com esse nome
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.name, name.trim()))
      .limit(1);

    if (existingCategory.length > 0) {
      return NextResponse.json({ 
        error: 'Já existe uma categoria com esse nome' 
      }, { status: 409 });
    }

    const [newCategory] = await db
      .insert(categories)
      .values({
        name: name.trim(),
        threshold: threshold ? Number(threshold) : null,
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}