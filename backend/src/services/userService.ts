import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/database';
import { User } from '../types';

export class UserService {
  static async findByUsername(username: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, row: User) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  static async findById(id: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (err, row: User) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  static async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
  }

  static async authenticate(username: string, password: string) {
    const user = await this.findByUsername(username);
    
    if (!user) {
      return null;
    }

    const isValidPassword = await this.validatePassword(password, user.password_hash);
    
    if (!isValidPassword) {
      return null;
    }

    const token = this.generateToken(user.id);
    
    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token
    };
  }
}