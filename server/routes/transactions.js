const express = require('express');
const jwt = require('jsonwebtoken');
const Transaction = require('../models/Transaction');
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

// Get personal transactions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, type } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (type) filters.type = type;

    const result = await Transaction.findByUserId(req.userId, filters, parseInt(page), parseInt(limit));

    res.json(result);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get group transactions
router.get('/group/:groupId', authenticateToken, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await Transaction.findByGroupId(groupId, parseInt(page), parseInt(limit));

    res.json(result);
  } catch (error) {
    console.error('Get group transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create transaction
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, amount, category, description, date, groupId, splitType } = req.body;

    const transaction = await Transaction.create({
      userId: req.userId,
      type,
      amount,
      category,
      description,
      date: date || new Date().toISOString().split('T')[0],
      groupId: groupId || null,
      splitType: splitType || 'personal'
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update transaction
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, category, description, date } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction || transaction.user_id !== req.userId) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    const updatedTransaction = await Transaction.update(id, {
      type: type || transaction.type,
      amount: amount || transaction.amount,
      category: category || transaction.category,
      description: description !== undefined ? description : transaction.description,
      date: date || transaction.date
    });

    res.json({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete transaction
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Transaction.delete(id, req.userId);
    if (!deleted) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.json({
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
