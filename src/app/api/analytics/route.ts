import { NextRequest, NextResponse } from 'next/server';
import { eq, and, gte, lt, desc, sql, asc } from 'drizzle-orm';
import { db } from '@/db';
import { categories, transactions } from '@/db/schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') as 'weekly' | 'monthly' | 'yearly' || 'monthly';
    
    // Calcular datas baseado no período
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);
    
    switch (period) {
      case 'weekly':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
      default: // monthly
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }

    // 1. Buscar gastos por categoria
    const categorySpending = await db
      .select({
        categoryId: categories.id,
        categoryName: categories.name,
        categoryThreshold: categories.threshold,
        totalAmount: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
        transactionCount: sql<number>`COUNT(${transactions.id})`,
      })
      .from(categories)
      .leftJoin(
        transactions,
        and(
          eq(transactions.categoryId, categories.id),
          eq(transactions.type, 'expense'),
          gte(transactions.date, startDate),
          lt(transactions.date, endDate)
        )
      )
      .groupBy(categories.id, categories.name, categories.threshold);

    // 2. Buscar dados de entrada vs saída ao longo do tempo
    let timeGrouping;
    let dateFormat;
    
    if (period === 'weekly') {
      timeGrouping = sql<string>`DATE(${transactions.date})`;
      dateFormat = 'daily';
    } else if (period === 'monthly') {
      timeGrouping = sql<string>`DATE(${transactions.date})`;
      dateFormat = 'daily';
    } else {
      timeGrouping = sql<string>`strftime('%Y-%m', ${transactions.date})`;
      dateFormat = 'monthly';
    }

    const incomeExpenseData = await db
      .select({
        period: timeGrouping,
        income: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
        expenses: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
      })
      .from(transactions)
      .where(
        and(
          gte(transactions.date, startDate),
          lt(transactions.date, endDate)
        )
      )
      .groupBy(timeGrouping)
      .orderBy(timeGrouping);

    // 3. Buscar maiores gastos
    const topExpenses = await db
      .select({
        id: transactions.id,
        description: transactions.description,
        amount: transactions.amount,
        date: transactions.date,
        categoryName: categories.name,
        categoryId: categories.id,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.type, 'expense'),
          gte(transactions.date, startDate),
          lt(transactions.date, endDate)
        )
      )
      .orderBy(desc(transactions.amount))
      .limit(5);

    // 4. Calcular resumo geral
    const summary = await db
      .select({
        totalIncome: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'income' THEN ${transactions.amount} ELSE 0 END), 0)`,
        totalExpense: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'expense' THEN ${transactions.amount} ELSE 0 END), 0)`,
        transactionCount: sql<number>`COUNT(*)`,
      })
      .from(transactions)
      .where(
        and(
          gte(transactions.date, startDate),
          lt(transactions.date, endDate)
        )
      );

    // 5. Calcular tendências (comparar com período anterior)
    const previousPeriodStart = new Date(startDate);
    const previousPeriodEnd = new Date(endDate);
    
    if (period === 'weekly') {
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
      previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 7);
    } else if (period === 'monthly') {
      previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
      previousPeriodEnd.setMonth(previousPeriodEnd.getMonth() - 1);
    } else {
      previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1);
      previousPeriodEnd.setFullYear(previousPeriodEnd.getFullYear() - 1);
    }

    const previousCategorySpending = await db
      .select({
        categoryId: categories.id,
        totalAmount: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
      })
      .from(categories)
      .leftJoin(
        transactions,
        and(
          eq(transactions.categoryId, categories.id),
          eq(transactions.type, 'expense'),
          gte(transactions.date, previousPeriodStart),
          lt(transactions.date, previousPeriodEnd)
        )
      )
      .groupBy(categories.id);

    // Mapear cores para categorias
    const categoryColors: Record<string, string> = {
      'Mercado': '#FF6B6B',
      'Necessidades': '#4ECDC4',
      'Eletronicos': '#45B7D1',
      'Assinaturas': '#96CEB4',
      'Roupa': '#FECA57',
      'Beleza': '#A29BFE',
      'Presentes': '#FD79A8',
      'Saúde': '#FF8A80',
      'Despesas Eventuais': '#FDCB6E',
      'Desenvolvimento': '#81C784',
      'Uber ou Transporte': '#64B5F6',
      'IFood ou Restaurante': '#FFB74D',
      'Lazer': '#BA68C8',
      'Aluguel': '#4DB6AC',
      'Contas': '#F06292',
    };



    // Processar dados para o frontend
    const processedCategorySpending = categorySpending.map(cat => {
      const previousSpending = previousCategorySpending.find(p => p.categoryId === cat.categoryId);
      const previousAmount = previousSpending?.totalAmount || 0;
      const currentAmount = cat.totalAmount;
      
      const trendPercentage = previousAmount > 0 
        ? ((currentAmount - previousAmount) / previousAmount) * 100 
        : currentAmount > 0 ? 100 : 0;

      return {
        name: cat.categoryName,
        value: currentAmount,
        budget: cat.categoryThreshold || 0,
        transactions: cat.transactionCount,
        color: categoryColors[cat.categoryName] || '#9CA3AF',
        icon: cat.categoryId, // Vamos retornar o ID para o frontend usar com getIcon()
        categoryId: cat.categoryId, // Adicionar categoryId para as tendências
        trend: trendPercentage >= 0 ? 'up' as const : 'down' as const,
        percentage: Math.abs(trendPercentage),
        comparison: period === 'weekly' ? 'semana anterior' : 
                   period === 'monthly' ? 'mês anterior' : 
                   'ano anterior',
      };
    });

    // Processar dados de entrada vs saída
    const processedIncomeExpense = incomeExpenseData.map((item, index) => {
      let periodLabel;
      
      if (period === 'weekly') {
        periodLabel = `Dia ${index + 1}`;
      } else if (period === 'monthly') {
        // Certificar que item.period é string e está no formato correto
        const dateStr = item.period as string;
        if (dateStr) {
          const date = new Date(dateStr);
          periodLabel = date.getDate().toString();
        } else {
          periodLabel = `Dia ${index + 1}`;
        }
      } else {
        // Para yearly, item.period está no formato 'YYYY-MM'
        const periodStr = item.period as string;
        if (periodStr) {
          const [year, month] = periodStr.split('-');
          const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
          periodLabel = months[parseInt(month) - 1] || 'N/A';
        } else {
          periodLabel = 'N/A';
        }
      }
      
      return {
        period: periodLabel,
        income: item.income,
        expenses: item.expenses,
      };
    });

    // Processar maiores gastos
    const processedTopExpenses = topExpenses.map(expense => ({
      name: expense.description,
      category: expense.categoryName || 'Outros',
      amount: expense.amount,
      categoryId: expense.categoryId, // Retornar o ID para o frontend usar com getIcon()
      date: expense.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    }));

    const totalBudget = processedCategorySpending.reduce((sum, cat) => sum + (cat.budget || 0), 0);
    const budgetUsed = totalBudget > 0 
      ? (processedCategorySpending.reduce((sum, cat) => sum + cat.value, 0) / totalBudget) * 100 
      : 0;

    const analyticsData = {
      categorySpending: processedCategorySpending,
      incomeVsExpenses: processedIncomeExpense,
      topExpenses: processedTopExpenses,
      trends: processedCategorySpending.filter(cat => cat.percentage > 5).map(trend => ({
        name: trend.name,
        categoryId: trend.categoryId,
        trend: trend.trend,
        percentage: trend.percentage,
        comparison: trend.comparison
      })), // Só tendências significativas
      summary: {
        totalIncome: summary[0]?.totalIncome || 0,
        totalExpenses: summary[0]?.totalExpense || 0,
        savings: (summary[0]?.totalIncome || 0) - (summary[0]?.totalExpense || 0),
        budgetUsed: Math.round(budgetUsed),
        transactionCount: summary[0]?.transactionCount || 0,
      },
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Erro ao buscar analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Função auxiliar para gerar ícones baseado na descrição (não usada mais, mantida para compatibilidade)
function getExpenseIcon(description: string, categoryName?: string): string {
  const desc = description.toLowerCase();
  
  if (desc.includes('supermercado') || desc.includes('mercado')) return '🛒';
  if (desc.includes('posto') || desc.includes('gasolina') || desc.includes('combustível')) return '⛽';
  if (desc.includes('cinema') || desc.includes('filme')) return '🎬';
  if (desc.includes('farmácia') || desc.includes('remédio')) return '💊';
  if (desc.includes('restaurante') || desc.includes('lanche')) return '🍔';
  if (desc.includes('uber') || desc.includes('taxi')) return '🚕';
  if (desc.includes('amazon') || desc.includes('loja')) return '📦';
  if (desc.includes('academia') || desc.includes('gym')) return '💪';
  if (desc.includes('conta') || desc.includes('energia') || desc.includes('água')) return '🔌';
  
  // Fallback para categoria
  const categoryIcons: Record<string, string> = {
    'Mercado': '🛒',
    'Necessidades': '🏠',
    'Eletronicos': '📱',
    'Assinaturas': '📺',
    'Roupa': '👕',
    'Beleza': '💄',
    'Presentes': '🎁',
    'Saúde': '❤️',
    'Despesas Eventuais': '💸',
    'Desenvolvimento': '💻',
    'Uber ou Transporte': '🚗',
    'IFood ou Restaurante': '🍔',
    'Lazer': '🎮',
    'Aluguel': '🏡',
    'Contas': '💳',
  };
  
  return categoryIcons[categoryName || ''];
}