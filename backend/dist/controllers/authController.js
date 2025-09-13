"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const userService_1 = require("../services/userService");
class AuthController {
    static async login(req, res) {
        try {
            const { username, password } = req.body;
            const result = await userService_1.UserService.authenticate(username, password);
            if (!result) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
            }
            return res.json({
                success: true,
                message: 'Login successful',
                data: result
            });
        }
        catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    static async me(req, res) {
        try {
            const { password_hash, ...userWithoutPassword } = req.user;
            return res.json({
                success: true,
                message: 'User profile retrieved',
                data: userWithoutPassword
            });
        }
        catch (error) {
            console.error('Profile error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map