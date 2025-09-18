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
        settings: user.settings
      })
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (userData.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // Configurações padrão caso não existam
    const defaultSettings = {
      darkMode: false,
      currency: 'BRL',
      dateFormat: 'dd/mm/yyyy',
      notifications: true,
      budgetAlerts: true,
      weeklyReport: false
    };

    let userSettings = defaultSettings;
    if (userData[0].settings) {
      try {
        userSettings = { ...defaultSettings, ...JSON.parse(userData[0].settings as string) };
      } catch (error) {
        console.error('Erro ao parsear configurações:', error);
      }
    }

    return NextResponse.json(userSettings, { status: 200 });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
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
    const { darkMode, currency, dateFormat, notifications, budgetAlerts, weeklyReport } = body;

    const settings = {
      darkMode: Boolean(darkMode),
      currency: currency || 'BRL',
      dateFormat: dateFormat || 'dd/mm/yyyy',
      notifications: Boolean(notifications),
      budgetAlerts: Boolean(budgetAlerts),
      weeklyReport: Boolean(weeklyReport)
    };

    await db
      .update(user)
      .set({
        settings: JSON.stringify(settings),
        updatedAt: Date.now(),
      })
      .where(eq(user.id, session.user.id));

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
