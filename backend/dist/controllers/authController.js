"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.login = void 0;
const userService_1 = require("../services/userService");
const login = async (req, res) => {
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
            message: 'Internal server error'
        });
    }
};
exports.login = login;
const me = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        return res.json({
            success: true,
            message: 'User information retrieved successfully',
            data: {
                user: req.user
            }
        });
    }
    catch (error) {
        console.error('Get user info error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.me = me;
//# sourceMappingURL=authController.js.map