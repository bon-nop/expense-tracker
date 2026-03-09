const db = require('../config/database');

class Balance {
  static async findByGroupId(groupId) {
    const conn = await db.getConnection();
    try {
      const rows = await conn.query(
        'SELECT b.*, u.name as user_name, u.profile_picture as user_profile FROM balances b LEFT JOIN users u ON b.user_id = u.id WHERE b.group_id = ? ORDER BY b.net_balance DESC',
        [groupId]
      );
      
      return rows;
    } catch (error) {
      console.error('Database Error in Balance.findByGroupId:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  static async findByGroupAndUser(groupId, userId) {
    const conn = await db.getConnection();
    try {
      const rows = await conn.query(
        'SELECT * FROM balances WHERE group_id = ? AND user_id = ?',
        [groupId, userId]
      );
      
      return rows[0] || null;
    } catch (error) {
      console.error('Database Error in Balance.findByGroupAndUser:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  static async settleDebt(groupId, fromUserId, toUserId, amount) {
    const conn = await db.getConnection();
    try {
      // Update from user (they owe less)
      await conn.query(
        'UPDATE balances SET owes = owes - ?, net_balance = net_balance + ? WHERE group_id = ? AND user_id = ?',
        [amount, amount, groupId, fromUserId]
      );
      
      // Update to user (they are owed less)
      await conn.query(
        'UPDATE balances SET owed = owed - ?, net_balance = net_balance - ? WHERE group_id = ? AND user_id = ?',
        [amount, amount, groupId, toUserId]
      );
      
      return true;
    } catch (error) {
      console.error('Database Error in Balance.settleDebt:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  static async createOrUpdate(groupId, userId, owes = 0, owed = 0) {
    const netBalance = owed - owes;
    
    const conn = await db.getConnection();
    try {
      await conn.query(
        'INSERT INTO balances (group_id, user_id, owes, owed, net_balance) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE owes = ?, owed = ?, net_balance = ?',
        [groupId, userId, owes, owed, netBalance, owes, owed, netBalance]
      );
      
      return await this.findByGroupAndUser(groupId, userId);
    } catch (error) {
      console.error('Database Error in Balance.createOrUpdate:', error);
      throw error;
    } finally {
      conn.release();
    }
  }
}

module.exports = Balance;
