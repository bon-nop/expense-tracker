import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useTransactions } from '../contexts/TransactionContext';
import { TRANSACTION_TYPES, TRANSACTION_CATEGORIES, CURRENCY } from '../utils/constants';

const Transactions = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    type: TRANSACTION_TYPES.EXPENSE,
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const { 
    transactions, 
    loading, 
    error, 
    getTransactions, 
    createTransaction,
    clearError 
  } = useTransactions();

  useEffect(() => {
    getTransactions(1, {
      type: filterType || undefined,
      category: filterCategory || undefined
    });
  }, [filterType, filterCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await createTransaction({
      ...formData,
      amount: parseFloat(formData.amount)
    });

    if (result.success) {
      setShowAddModal(false);
      setFormData({
        type: TRANSACTION_TYPES.EXPENSE,
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      getTransactions(1);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = formData.type === TRANSACTION_TYPES.INCOME 
    ? TRANSACTION_CATEGORIES.income 
    : TRANSACTION_CATEGORIES.expense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 inline mr-2" />
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="input-field"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value={TRANSACTION_TYPES.INCOME}>Income</option>
            <option value={TRANSACTION_TYPES.EXPENSE}>Expense</option>
          </select>

          <select
            className="input-field"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {[...TRANSACTION_CATEGORIES.income, ...TRANSACTION_CATEGORIES.expense].map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('');
              setFilterCategory('');
            }}
            className="btn-secondary"
          >
            <FunnelIcon className="h-5 w-5 inline mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
            <button onClick={clearError} className="ml-2 text-red-800 hover:text-red-900">×</button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500">No transactions found</p>
            <p className="text-sm text-gray-400">Add your first transaction to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((transaction) => (
              <div key={transaction._id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    transaction.type === TRANSACTION_TYPES.INCOME ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span className={`text-lg font-bold ${
                      transaction.type === TRANSACTION_TYPES.INCOME ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === TRANSACTION_TYPES.INCOME ? '+' : '-'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.description || 'No description'}
                    </p>
                    <p className="text-sm text-gray-500">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${
                    transaction.type === TRANSACTION_TYPES.INCOME ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === TRANSACTION_TYPES.INCOME ? '+' : '-'}{CURRENCY.symbol}{transaction.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Transaction</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  className="input-field"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value, category: ''})}
                >
                  <option value={TRANSACTION_TYPES.EXPENSE}>Expense</option>
                  <option value={TRANSACTION_TYPES.INCOME}>Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="input-field"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="input-field"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Optional description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
