import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { validateRequest } from '../middleware/validation';
import { loginSchema } from '../middleware/validation';
import { AuthRequest } from '../middleware/auth';

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const result = await UserService.authenticate(username, password);
    
    if (!result) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      } as ApiResponse);
    }

    return res.json({
      success: true,
      message: 'Login successful',
      data: result
    } as ApiResponse);

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      } as ApiResponse);
    }

    return res.json({
      success: true,
      message: 'User information retrieved successfully',
      data: {
        user: req.user
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Get user info error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
};