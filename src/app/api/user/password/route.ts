import { db } from "@/db";
import { account } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ 
        error: 'Senha atual e nova senha são obrigatórias' 
      }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ 
        error: 'Nova senha deve ter pelo menos 8 caracteres' 
      }, { status: 400 });
    }

    // Buscar a conta do usuário com senha
    const userAccount = await db
      .select({
        id: account.id,
        password: account.password
      })
      .from(account)
      .where(eq(account.userId, session.user.id))
      .limit(1);

    if (userAccount.length === 0 || !userAccount[0].password) {
      return NextResponse.json({ 
        error: 'Conta não encontrada ou usuário logado via provider externo' 
      }, { status: 404 });
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userAccount[0].password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ 
        error: 'Senha atual incorreta' 
      }, { status: 400 });
    }

    // Verificar se a nova senha é diferente da atual
    const isSamePassword = await bcrypt.compare(newPassword, userAccount[0].password);
    if (isSamePassword) {
      return NextResponse.json({ 
        error: 'A nova senha deve ser diferente da senha atual' 
      }, { status: 400 });
    }

    // Hash da nova senha
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Atualizar senha no banco
    await db
      .update(account)
      .set({
        password: hashedNewPassword,
        updatedAt: Date.now(),
      })
      .where(eq(account.userId, session.user.id));

    return NextResponse.json({ 
      message: 'Senha alterada com sucesso' 
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}