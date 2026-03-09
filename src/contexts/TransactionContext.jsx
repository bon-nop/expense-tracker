import React, { createContext, useContext, useReducer } from 'react';
import axios from 'axios';

const TransactionContext = createContext();

const transactionReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload.transactions,
        totalPages: action.payload.totalPages,
        currentPage: action.payload.currentPage,
        total: action.payload.total,
        loading: false
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
        loading: false
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction._id === action.payload._id ? action.payload : transaction
        ),
        loading: false
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(
          transaction => transaction._id !== action.payload
        ),
        loading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

const initialState = {
  transactions: [],
  totalPages: 1,
  currentPage: 1,
  total: 0,
  loading: false,
  error: null
};

export const TransactionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);

  const getTransactions = async (page = 1, filters = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const params = { page, ...filters };
      const response = await axios.get('/api/transactions', { params });
      
      dispatch({
        type: 'SET_TRANSACTIONS',
        payload: response.data
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch transactions';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  };

  const getGroupTransactions = async (groupId, page = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.get(`/api/transactions/group/${groupId}`, {
        params: { page }
      });
      
      dispatch({
        type: 'SET_TRANSACTIONS',
        payload: response.data
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch group transactions';
      dispatch({ type: 'SET_ERROR', payload: message });
    }
  };

  const createTransaction = async (transactionData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.post('/api/transactions', transactionData);
      
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: response.data.transaction
      });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create transaction';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const updateTransaction = async (id, transactionData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.put(`/api/transactions/${id}`, transactionData);
      
      dispatch({
        type: 'UPDATE_TRANSACTION',
        payload: response.data.transaction
      });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update transaction';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const deleteTransaction = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await axios.delete(`/api/transactions/${id}`);
      
      dispatch({
        type: 'DELETE_TRANSACTION',
        payload: id
      });
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete transaction';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    getTransactions,
    getGroupTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    clearError
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
