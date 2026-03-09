const bcrypt = require('bcryptjs');
const db = require('../config/database');

class User {
  static async create(userData) {
    const { email, password, name, profilePicture } = userData;
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const conn = await db.getConnection();
    try {
      const result = await conn.query(
        'INSERT INTO users (email, password, name, profile_picture) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, name, profilePicture || '']
      );
      
      // result.insertId is for MariaDB
      const insertId = Number(result.insertId);
      
      return {
        id: insertId,
        email,
        name,
        profilePicture: profilePicture || ''
      };
    } catch (error) {
      console.error('Database Error in User.create:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  static async findByEmail(email) {
    const conn = await db.getConnection();
    try {
      const rows = await conn.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Database Error in User.findByEmail:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  static async findById(id) {
    const conn = await db.getConnection();
    try {
      const rows = await conn.query(
        'SELECT id, email, name, profile_picture, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Database Error in User.findById:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  static async update(id, userData) {
    const { name, profilePicture } = userData;
    const conn = await db.getConnection();
    try {
      await conn.query(
        'UPDATE users SET name = ?, profile_picture = ? WHERE id = ?',
        [name, profilePicture || '', id]
      );
      
      return await this.findById(id);
    } catch (error) {
      console.error('Database Error in User.update:', error);
      throw error;
    } finally {
      conn.release();
    }
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
}

module.exports = User;
