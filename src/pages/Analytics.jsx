import React, { useState, useEffect } from 'react';
import { ChartBarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { CURRENCY, PERIOD_OPTIONS } from '../utils/constants';
import api from '../utils/api';

const Analytics = () => {
  const [period, setPeriod] = useState('month');
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    transactionCount: 0
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [summaryResponse, categoriesResponse] = await Promise.all([
        api.get(`/analytics/personal/summary?period=${period}`),
        api.get(`/analytics/personal/categories?period=${period}`)
      ]);

      setSummary(summaryResponse.data);
      setCategories(categoriesResponse.data.categories);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPercentageColor = (percentage) => {
    if (percentage > 30) return 'text-red-600';
    if (percentage > 15) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <select
          className="input-field w-auto"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
        >
          {PERIOD_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-gray-900">
                {CURRENCY.symbol}{summary.totalIncome.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
              <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Expense</p>
              <p className="text-2xl font-bold text-gray-900">
                {CURRENCY.symbol}{summary.totalExpense.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Net Balance</p>
              <p className={`text-2xl font-bold ${summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {CURRENCY.symbol}{Math.abs(summary.netBalance).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.transactionCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Expense by Category</h2>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No expense data for this period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Simple Bar Chart */}
              <div className="space-y-3">
                {categories.slice(0, 6).map((category, index) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {category.category}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {CURRENCY.symbol}{category.amount.toFixed(0)}
                        </span>
                        <span className={`text-sm font-medium ${getPercentageColor(category.percentage)}`}>
                          {category.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(category.percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total Expenses</span>
                  <span className="font-bold text-lg text-gray-900">
                    {CURRENCY.symbol}{summary.totalExpense.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Spending Insights */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Spending Insights</h2>
          <div className="space-y-4">
            {/* Average Daily Spending */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Average Daily Spending</h3>
              <p className="text-2xl font-bold text-gray-900">
                {CURRENCY.symbol}{summary.totalExpense > 0 
                  ? (summary.totalExpense / getDaysInPeriod()).toFixed(2)
                  : '0.00'
                }
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Based on {getDaysInPeriod()} days in this period
              </p>
            </div>

            {/* Top Category */}
            {categories.length > 0 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-2">Top Spending Category</h3>
                <p className="text-lg font-bold text-gray-900">{categories[0].category}</p>
                <p className="text-sm text-gray-600">
                  {CURRENCY.symbol}{categories[0].amount.toFixed(2)} ({categories[0].percentage}%)
                </p>
              </div>
            )}

            {/* Savings Rate */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Savings Rate</h3>
              <p className="text-2xl font-bold text-gray-900">
                {summary.totalIncome > 0 
                  ? ((summary.totalIncome - summary.totalExpense) / summary.totalIncome * 100).toFixed(1)
                  : '0.0'
                }%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.netBalance >= 0 ? 'Great job saving!' : 'Consider reducing expenses'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">📊 Track Regularly</h3>
            <p className="text-sm text-blue-700">
              Record expenses as they happen to maintain accurate financial data.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">🎯 Set Budget Goals</h3>
            <p className="text-sm text-green-700">
              Use your spending insights to set realistic monthly budgets.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-2">💰 Build Emergency Fund</h3>
            <p className="text-sm text-purple-700">
              Aim to save 3-6 months of expenses for financial security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  function getDaysInPeriod() {
    const now = new Date();
    switch (period) {
      case 'week':
        return 7;
      case 'month':
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      case 'year':
        return 365;
      default:
        return 30;
    }
  }
};

export default Analytics;
