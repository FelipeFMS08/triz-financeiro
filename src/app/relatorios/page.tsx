"use client";

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Target,
  AlertCircle,
  Award,
  Eye
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { useAnalytics } from '@/hooks/use-analytics';
import { getIcon } from '@/components/common/dashboard/categories/categories';
import { Transactions } from '@/components/common/dashboard/transactions';

export default function Relatorios() {
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const { data, loading, error } = useAnalytics(selectedPeriod);

  const periodLabels = {
    weekly: 'Semanal',
    monthly: 'Mensal', 
    yearly: 'Anual'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando análises...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center max-w-sm">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-600 text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center max-w-sm">
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Sem dados disponíveis</h2>
          <p className="text-gray-600 text-sm">Não há transações para o período selecionado.</p>
        </div>
      </div>
    );
  }

  const categoryDataWithSpending = data.categorySpending.filter((cat: any) => cat.value > 0);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-800">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-b-zinc-100 dark:border-b-zinc-600">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">Relatórios</h1>
            <div className="w-9" />
          </div>

          {/* Period Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-600">
            {(['weekly', 'monthly', 'yearly'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-white dark:bg-[#A8E6CF] text-zinc-900 '
                    : 'text-zinc-800 dark:text-white hover:text-zinc-900'
                }`}
              >
                {periodLabels[period]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        <Transactions entrances={data.summary.totalIncome} exits={data.summary.totalExpenses}/>
      
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm opacity-90">Saldo {periodLabels[selectedPeriod]}</span>
            <Award className="h-5 w-5 opacity-80" />
          </div>
          <p className="text-2xl font-bold mb-1">
            R$ {data.summary.savings.toLocaleString('pt-BR')}
          </p>
          <p className="text-xs opacity-75">
            {data.summary.transactionCount} transações • {data.summary.budgetUsed}% do orçamento
          </p>
        </div>

        {/* Category Spending - só mostrar se houver dados */}
        {categoryDataWithSpending.length > 0 && (
          <div className="bg-white rounded-2xl p-4  dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-600">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Gastos por Categoria</h3>
            
            {/* Pie Chart */}
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDataWithSpending}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {categoryDataWithSpending.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Gasto']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category List */}
            <div className="space-y-3">
              {categoryDataWithSpending.map((category: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">{category.name}</span>
                      {category.budget > 0 && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[100px]">
                            <div 
                              className="h-1.5 rounded-full"
                              style={{ 
                                backgroundColor: category.color,
                                width: `${Math.min((category.value / category.budget) * 100, 100)}%`
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-white">
                            {Math.round((category.value / category.budget) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                    R$ {category.value.toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Income vs Expenses Chart - só mostrar se houver dados */}
        {data.incomeVsExpenses.length > 0 && (
          <div className="bg-white rounded-2xl p-4  dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-600">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Entradas vs. Saídas</h3>
            
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.incomeVsExpenses}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="period" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#666' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#666' }}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `R$ ${value.toLocaleString('pt-BR')}`, 
                      name === 'income' ? 'Entradas' : 'Saídas'
                    ]}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stackId="1"
                    stroke="#10B981"
                    fill="rgba(16, 185, 129, 0.1)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stackId="2" 
                    stroke="#EF4444"
                    fill="rgba(239, 68, 68, 0.1)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Top Expenses - só mostrar se houver dados */}
        {data.topExpenses.length > 0 && (
          <div className="bg-white rounded-2xl p-4  dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-600">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Maiores Gastos</h3>
            
            <div className="space-y-3">
              {data.topExpenses.map((expense: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-600 rounded-xl">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    {getIcon(expense.categoryId)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-zinc-900 dark:text-white text-sm">{expense.name}</p>
                    <p className="text-xs text-gray-500 dark:text-white">{expense.category} • {expense.date}</p>
                  </div>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    R$ {expense.amount.toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trends Analysis - só mostrar se houver tendências significativas */}
        {data.trends.length > 0 && (
          <div className="bg-white rounded-2xl p-4  dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-600">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Tendências</h3>
            </div>
            
            <div className="space-y-3">
              {data.trends.slice(0, 4).map((trend: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-600 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="text-lg">
                      {getIcon(trend.categoryId)}
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white text-sm">{trend.name}</p>
                      <p className="text-xs text-gray-500 dark:text-white">vs. {trend.comparison}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {trend.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      trend.trend === 'up' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {trend.trend === 'up' ? '+' : '-'}{trend.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget Overview - só mostrar categorias com orçamento */}
        {categoryDataWithSpending.some(cat => cat.budget > 0) && (
          <div className="bg-white rounded-2xl p-4  dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-600" >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Visão do Orçamento</h3>
              <Eye className="h-5 w-5 text-gray-400 dark:text-white" />
            </div>
            
            <div className="space-y-4">
              {categoryDataWithSpending
                .filter(category => category.budget > 0)
                .map((category, index) => {
                const percentUsed = (category.value / category.budget) * 100;
                const isOverBudget = percentUsed > 100;
                const isNearLimit = percentUsed > 80;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-900 dark:text-white">{category.name}</span>
                        {isOverBudget && (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-white">
                        R$ {category.value.toLocaleString('pt-BR')} / R$ {category.budget.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          isOverBudget ? 'bg-red-500' : 
                          isNearLimit ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-medium ${
                        isOverBudget ? 'text-red-600' : 
                        isNearLimit ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {percentUsed.toFixed(0)}% usado
                      </span>
                      {isOverBudget && (
                        <span className="text-red-600 font-medium">
                          R$ {(category.value - category.budget).toLocaleString('pt-BR')} acima
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Insights */}
        <div className={`bg-gradient-to-br ${data.summary.savings >= 0 ? 'from-[#A8E6CF] to-[#2ae6a1]' : 'from-[#ffd6d3] to-[#ff7e78]' } rounded-2xl p-4 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-600`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">💡</span>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">Insights</h3>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-zinc-800">
              • Você {data.summary.savings >= 0 
                ? `economizou R$ ${data.summary.savings.toLocaleString('pt-BR')}` 
                : `gastou R$ ${Math.abs(data.summary.savings).toLocaleString('pt-BR')} a mais do que ganhou`}
            </p>
            {categoryDataWithSpending.length > 0 && (
              <p className="text-sm text-zinc-800">
                • Sua maior categoria de gasto foi {categoryDataWithSpending.reduce((max, cat) => 
                  cat.value > max.value ? cat : max).name}
              </p>
            )}
            <p className="text-sm text-zinc-800">
              • Você fez {data.summary.transactionCount} transações neste período
            </p>
            {categoryDataWithSpending.some(cat => cat.budget > 0 && (cat.value / cat.budget) > 1) && (
              <p className="text-sm text-red-500 font-medium">
                ⚠️ Você ultrapassou o orçamento em algumas categorias
              </p>
            )}
          </div>
        </div>

        {/* Bottom spacing for navigation */}
        <div className="h-20" />
      </div>
    </div>
  );
}