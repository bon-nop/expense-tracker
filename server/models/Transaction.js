const db = require('../config/database');

class Transaction {
  static async create(transactionData) {
    const { userId, groupId, type, amount, category, description, date, splitType } = transactionData;
    
    const conn = await db.getConnection();
    try {
      // Start transaction
      await conn.beginTransaction();
      
      // Create transaction
      const result = await conn.query(
        'INSERT INTO transactions (user_id, group_id, type, amount, category, description, date, split_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, groupId || null, type, amount, category, description || '', date, splitType || 'personal']
      );
      
      const transactionId = Number(result.insertId);
      
      // If it's a group transaction with equal split, update balances
      if (groupId && splitType === 'equal') {
        await this.updateGroupBalances(conn, groupId, transactionId, userId, amount);
      }
      
      await conn.commit();
      
      return await this.findById(transactionId);
    } catch (error) {
      await conn.rollback();
      console.error('Database Error in Transaction.create:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  static async findById(id) {
    const conn = await db.getConnection();
    try {
      const rows = await conn.query(
        'SELECT t.*, u.name as user_name, u.profile_picture as user_profile FROM transactions t LEFT JOIN users u ON t.user_id = u.id WHERE t.id = ?',
        [id]
      );
      
      if (rows && rows.length > 0) {
        const transaction = rows[0];
        
        // Get splits if any
        const splitRows = await conn.query(
          'SELECT ts.*, u.name as split_user_name FROM transaction_splits ts LEFT JOIN users u ON ts.user_id = u.id WHERE ts.transaction_id = ?',
          [id]
        );
        
        transaction.splitBetween = splitRows;
        return transaction;
      }
      
      return null;
    } catch (error) {
      console.error('Database Error in Transaction.findById:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  static async findByUserId(userId, filters = {}, page = 1, limit = 20) {
    const { category, type } = filters;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE t.user_id = ? AND t.group_id IS NULL';
    const params = [userId];
    
    if (category) {
      whereClause += ' AND t.category = ?';
      params.push(category);
    }
    
    if (type) {
      whereClause += ' AND t.type = ?';
      params.push(type);
    }
    
    const conn = await db.getConnection();
    try {
      // Get total count
      const countRows = await conn.query(
        `SELECT COUNT(*) as total FROM transactions t ${whereClause}`,
        params
      );
      
      const total = Number(countRows[0].total);
      
      // Get transactions
      const rows = await conn.query(
        `SELECT t.*, u.name as user_name, u.profile_picture as user_profile 
         FROM transactions t 
         LEFT JOIN users u ON t.user_id = u.id 
         ${whereClause} 
         ORDER BY t.date DESC 
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );
      
      return {
        transactions: rows,
        total: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      };
    } catch (error) {
      console.error('Database Error in Transaction.findByUserId:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  static async findByGroupId(groupId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    const conn = await db.getConnection();
    try {
      // Get total count
      const countRows = await conn.query(
        'SELECT COUNT(*) as total FROM transactions WHERE group_id = ?',
        [groupId]
      );
      
      const total = Number(countRows[0].total);
      
      // Get transactions
      const rows = await conn.query(
        'SELECT t.*, u.name as user_name, u.profile_picture as user_profile FROM transactions t LEFT JOIN users u ON t.user_id = u.id WHERE t.group_id = ? ORDER BY t.date DESC LIMIT ? OFFSET ?',
        [groupId, limit, offset]
      );
      
      return {
        transactions: rows,
        total: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      };
    } catch (error) {
      console.error('Database Error in Transaction.findByGroupId:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  static async update(id, updateData) {
    const { type, amount, category, description } = updateData;
    
    const conn = await db.getConnection();
    try {
      await conn.query(
        'UPDATE transactions SET type = ?, amount = ?, category = ?, description = ? WHERE id = ?',
        [type, amount, category, description || '', id]
      );
      
      return await this.findById(id);
    } catch (error) {
      console.error('Database Error in Transaction.update:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  static async delete(id, userId) {
    const conn = await db.getConnection();
    try {
      const result = await conn.query(
        'DELETE FROM transactions WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Database Error in Transaction.delete:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  static async updateGroupBalances(conn, groupId, transactionId, payerId, amount) {
    // Get all group members except the payer
    const memberRows = await conn.query(
      'SELECT user_id FROM group_members WHERE group_id = ? AND user_id != ?',
      [groupId, payerId]
    );
    
    if (!memberRows || memberRows.length === 0) return;
    
    const splitAmount = amount / (memberRows.length + 1); // +1 for the payer
    
    // Update balances for each member
    for (const member of memberRows) {
      const memberId = member.user_id;
      
      // Member owes money
      await conn.query(
        'INSERT INTO balances (group_id, user_id, owes, owed, net_balance) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE owes = owes + ?, net_balance = net_balance - ?',
        [groupId, memberId, splitAmount, 0, -splitAmount, splitAmount, splitAmount]
      );
      
      // Payer is owed money
      await conn.query(
        'INSERT INTO balances (group_id, user_id, owes, owed, net_balance) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE owed = owed + ?, net_balance = net_balance + ?',
        [groupId, payerId, 0, splitAmount, splitAmount, splitAmount, splitAmount]
      );
      
      // Add transaction split record
      await conn.query(
        'INSERT INTO transaction_splits (transaction_id, user_id, amount) VALUES (?, ?, ?)',
        [transactionId, memberId, splitAmount]
      );
    }
  }
}

module.exports = Transaction;
