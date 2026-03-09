const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get personal analytics summary
router.get('/personal/summary', authenticateToken, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const conn = await db.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT 
          type,
          SUM(amount) as total,
          COUNT(*) as count
         FROM transactions 
         WHERE user_id = ? AND group_id IS NULL 
         AND date BETWEEN ? AND ?
         GROUP BY type`,
        [req.userId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
      );

      const totalIncome = rows.find(r => r.type === 'income')?.total || 0;
      const totalExpense = rows.find(r => r.type === 'expense')?.total || 0;
      const transactionCount = rows.reduce((sum, r) => sum + r.count, 0);
      const netBalance = totalIncome - totalExpense;

      res.json({
        period,
        totalIncome,
        totalExpense,
        netBalance,
        transactionCount
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Personal summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get personal category breakdown
router.get('/personal/categories', authenticateToken, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const conn = await db.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT 
          category,
          SUM(amount) as total
         FROM transactions 
         WHERE user_id = ? AND group_id IS NULL 
         AND type = 'expense'
         AND date BETWEEN ? AND ?
         GROUP BY category
         ORDER BY total DESC`,
        [req.userId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
      );

      const totalExpense = rows.reduce((sum, row) => sum + row.total, 0);

      const categories = rows.map(row => ({
        category: row.category,
        amount: row.total,
        percentage: totalExpense > 0 ? (row.total / totalExpense * 100).toFixed(1) : 0
      }));

      res.json({
        period,
        categories,
        totalExpense
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Personal categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get group analytics summary
router.get('/group/:id/summary', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { period = 'month' } = req.query;

    // Check if user is member of the group
    const Group = require('../models/Group');
    const isMember = await Group.isMember(id, req.userId);
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }

    const conn = await db.getConnection();
    try {
      const [rows] = await conn.query(
        `SELECT 
          type,
          SUM(amount) as total,
          COUNT(*) as count
         FROM transactions 
         WHERE group_id = ? 
         AND date BETWEEN ? AND ?
         GROUP BY type`,
        [id, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
      );

      const totalIncome = rows.find(r => r.type === 'income')?.total || 0;
      const totalExpense = rows.find(r => r.type === 'expense')?.total || 0;
      const transactionCount = rows.reduce((sum, r) => sum + r.count, 0);

      res.json({
        period,
        totalExpense,
        totalIncome,
        transactionCount
      });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Group summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
