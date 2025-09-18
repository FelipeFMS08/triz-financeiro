'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  categorySpending: any[];
  incomeVsExpenses: any[];
  topExpenses: any[];
  trends: any[];
  summary: {
    totalIncome: number;
    totalExpenses: number;
    savings: number;
    budgetUsed: number;
    transactionCount: number;
  };
}

export const useAnalytics = (period: 'weekly' | 'monthly' | 'yearly' = 'monthly') => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/analytics?period=${period}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const analyticsData: AnalyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        console.error('Erro ao carregar analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  return { data, loading, error };
};