const express = require('express');
const jwt = require('jsonwebtoken');
const Group = require('../models/Group');
const Balance = require('../models/Balance');
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

// Get user's groups
router.get('/', authenticateToken, async (req, res) => {
  try {
    const groups = await Group.findByUserId(req.userId);

    res.json({ groups });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create group
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    const group = await Group.create({ name, ownerId: req.userId });

    res.status(201).json({
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get group details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is member or owner
    const isMember = await Group.isMember(id, req.userId);
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ group });
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join group by invite code
router.post('/join', authenticateToken, async (req, res) => {
  try {
    const { inviteCode } = req.body;

    const group = await Group.findByInviteCode(inviteCode.toUpperCase());
    if (!group) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    // Check if user is already a member
    const isMember = await Group.isMember(group.id, req.userId);
    if (isMember) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }

    // Add user to group
    const updatedGroup = await Group.addMember(group.id, req.userId);

    res.json({
      message: 'Joined group successfully',
      group: updatedGroup
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get group balances
router.get('/:id/balances', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is member of the group
    const isMember = await Group.isMember(id, req.userId);
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const balances = await Balance.findByGroupId(id);

    res.json({ balances });
  } catch (error) {
    console.error('Get balances error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Settle debt
router.post('/:id/settle', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { fromUserId, toUserId, amount } = req.body;

    // Check if user is member of the group
    const isMember = await Group.isMember(id, req.userId);
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update balances
    await Balance.settleDebt(id, fromUserId, toUserId, amount);

    res.json({
      message: 'Debt settled successfully'
    });
  } catch (error) {
    console.error('Settle debt error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
