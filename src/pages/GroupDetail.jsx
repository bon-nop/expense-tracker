import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useTransactions } from '../contexts/TransactionContext';
import { TRANSACTION_TYPES, TRANSACTION_CATEGORIES, CURRENCY } from '../utils/constants';
import api from '../utils/api';

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [balances, setBalances] = useState([]);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: TRANSACTION_TYPES.EXPENSE,
    amount: '',
    category: '',
    description: '',
    splitType: 'equal',
    splitBetween: []
  });

  const { 
    transactions, 
    loading: transactionsLoading, 
    getGroupTransactions, 
    createTransaction 
  } = useTransactions();

  useEffect(() => {
    fetchGroupData();
    getGroupTransactions(id);
  }, [id]);

  const fetchGroupData = async () => {
    try {
      const [groupResponse, balancesResponse] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/groups/${id}/balances`)
      ]);
      
      setGroup(groupResponse.data.group);
      setBalances(balancesResponse.data.balances);
    } catch (error) {
      console.error('Failed to fetch group data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      groupId: id
    };

    const result = await createTransaction(transactionData);
    if (result.success) {
      setShowAddTransactionModal(false);
      setFormData({
        type: TRANSACTION_TYPES.EXPENSE,
        amount: '',
        category: '',
        description: '',
        splitType: 'equal',
        splitBetween: []
      });
      getGroupTransactions(id);
      fetchGroupData(); // Refresh balances
    }
  };

  const handleSettleDebt = async (fromUserId, toUserId, amount) => {
    try {
      await api.post(`/groups/${id}/settle`, {
        fromUserId,
        toUserId,
        amount
      });
      fetchGroupData(); // Refresh balances
    } catch (error) {
      console.error('Failed to settle debt:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Group not found</h2>
        <button onClick={() => navigate('/groups')} className="btn-primary">
          Back to Groups
        </button>
      </div>
    );
  }

  const categories = formData.type === TRANSACTION_TYPES.INCOME 
    ? TRANSACTION_CATEGORIES.income 
    : TRANSACTION_CATEGORIES.expense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/groups')}
            className="text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
            <p className="text-gray-600">Invite Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{group.inviteCode}</span></p>
          </div>
        </div>
        <button
          onClick={() => setShowAddTransactionModal(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 inline mr-2" />
          Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Members</p>
              <p className="text-2xl font-bold text-gray-900">{group.members.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                {CURRENCY.symbol}{transactions.reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : 0), 0).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Balances */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Balances</h2>
        {balances.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No balances to show</p>
        ) : (
          <div className="space-y-3">
            {balances.map((balance) => (
              <div key={balance._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {balance.userId?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{balance.userId?.name}</p>
                    <p className="text-sm text-gray-500">
                      Owes: {CURRENCY.symbol}{balance.owes.toFixed(2)} | Owed: {CURRENCY.symbol}{balance.owed.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg ${
                    balance.netBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {balance.netBalance >= 0 ? '+' : ''}{CURRENCY.symbol}{balance.netBalance.toFixed(2)}
                  </p>
                  {balance.netBalance !== 0 && (
                    <button
                      onClick={() => {/* Handle settle */}}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      Settle Up
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
        {transactionsLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction._id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <span className={`text-sm font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description || transaction.category}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.userId?.name} • {transaction.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{CURRENCY.symbol}{transaction.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Group Transaction</h2>
            
            <form onSubmit={handleAddTransaction} className="space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Split Type</label>
                <select
                  className="input-field"
                  value={formData.splitType}
                  onChange={(e) => setFormData({...formData, splitType: e.target.value})}
                >
                  <option value="equal">Split Equally</option>
                  <option value="personal">Personal Expense</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddTransactionModal(false)}
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

export default GroupDetail;
