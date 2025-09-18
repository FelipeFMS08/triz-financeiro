// app/api/user/profile/route.ts
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
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

    const userData = await db
      .select({
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (userData.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(userData[0], { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar perfil do usuário:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, image, phone, bio } = body;

    console.log(image);

    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        error: 'Nome é obrigatório' 
      }, { status: 400 });
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ 
        error: 'Email válido é obrigatório' 
      }, { status: 400 });
    }

    // Verificar se o email já está em uso por outro usuário
    if (email !== session.user.email) {
      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.email, email.trim()))
        .limit(1);

      if (existingUser.length > 0) {
        return NextResponse.json({ 
          error: 'Este email já está sendo usado por outro usuário' 
        }, { status: 409 });
      }
    }

    const [updatedUser] = await db
      .update(user)
      .set({
        name: name.trim(),
        email: email.trim(),
        updatedAt: Date.now(),
        image: image.trim()
      })
      .where(eq(user.id, session.user.id))
      .returning({
        name: user.name,
        email: user.email,
        image: user.image
      });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar perfil do usuário:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}