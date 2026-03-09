const db = require('../config/database');

class Group {
  static async create(groupData) {
    const { name, ownerId } = groupData;
    
    // Generate unique invite code
    const inviteCode = await this.generateInviteCode();
    
    const conn = await db.getConnection();
    try {
      // Start transaction
      await conn.beginTransaction();
      
      // Create group
      const result = await conn.query(
        'INSERT INTO groups (name, invite_code, owner_id) VALUES (?, ?, ?)',
        [name, inviteCode, ownerId]
      );
      
      const groupId = Number(result.insertId);
      
      // Add owner as member
      await conn.query(
        'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
        [groupId, ownerId]
      );
      
      await conn.commit();
      
      return {
        id: groupId,
        name,
        inviteCode,
        ownerId,
        members: [ownerId]
      };
    } catch (error) {
      await conn.rollback();
      console.error('Database Error in Group.create:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  static async findByInviteCode(inviteCode) {
    const conn = await db.getConnection();
    try {
      const rows = await conn.query(
        'SELECT * FROM groups WHERE invite_code = ?',
        [inviteCode]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Database Error in Group.findByInviteCode:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  static async findById(id) {
    const conn = await db.getConnection();
    try {
      const rows = await conn.query(
        'SELECT g.*, u.name as owner_name, u.profile_picture as owner_profile FROM groups g LEFT JOIN users u ON g.owner_id = u.id WHERE g.id = ?',
        [id]
      );
      
      if (rows[0]) {
        const group = rows[0];
        
        // Get members
        const memberRows = await conn.query(
          'SELECT u.id, u.name, u.profile_picture FROM users u JOIN group_members gm ON u.id = gm.user_id WHERE gm.group_id = ?',
          [id]
        );
        
        group.members = memberRows;
        return group;
      }
      
      return null;
    } catch (error) {
      console.error('Database Error in Group.findById:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  static async findByUserId(userId) {
    const conn = await db.getConnection();
    try {
      const rows = await conn.query(
        'SELECT DISTINCT g.* FROM groups g JOIN group_members gm ON g.id = gm.group_id WHERE gm.user_id = ? ORDER BY g.created_at DESC',
        [userId]
      );
      
      const groups = [];
      for (const row of rows) {
        const group = await this.findById(row.id);
        groups.push(group);
      }
      
      return groups;
    } catch (error) {
      console.error('Database Error in Group.findByUserId:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  static async addMember(groupId, userId) {
    const conn = await db.getConnection();
    try {
      await conn.query(
        'INSERT IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)',
        [groupId, userId]
      );
      
      return await this.findById(groupId);
    } catch (error) {
      console.error('Database Error in Group.addMember:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  static async isMember(groupId, userId) {
    const conn = await db.getConnection();
    try {
      const rows = await conn.query(
        'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?',
        [groupId, userId]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Database Error in Group.isMember:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  static async generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check if code already exists
    const existing = await this.findByInviteCode(code);
    if (existing) {
      return await this.generateInviteCode(); // Recursive call if code exists
    }
    
    return code;
  }
}

module.exports = Group;
