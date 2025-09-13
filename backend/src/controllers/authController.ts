import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { ApiResponse } from '../types';

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      const result = await UserService.authenticate(username, password);

      if (!result) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        } as ApiResponse);
      }

      res.json({
        success: true,
        message: 'Login successful',
        data: result
      } as ApiResponse);

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }

  static async me(req: any, res: Response) {
    try {
      const { password_hash, ...userWithoutPassword } = req.user;
      
      res.json({
        success: true,
        message: 'User profile retrieved',
        data: userWithoutPassword
      } as ApiResponse);

    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ApiResponse);
    }
  }
}