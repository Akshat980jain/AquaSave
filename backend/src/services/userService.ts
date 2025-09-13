import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

export class UserService {
  static async findByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username });
  }

  static async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  static async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(userId: string): string {
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    
    return jwt.sign(
      { userId },
      secret,
      { expiresIn } as any
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

    const token = this.generateToken((user._id as any).toString());
    
    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user.toObject();
    
    return {
      user: userWithoutPassword,
      token
    };
  }
}