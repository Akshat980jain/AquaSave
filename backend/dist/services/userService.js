"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
class UserService {
    static async findByUsername(username) {
        return await User_1.User.findOne({ username });
    }
    static async findById(id) {
        return await User_1.User.findById(id);
    }
    static async validatePassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
    static generateToken(userId) {
        const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
        const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
        return jsonwebtoken_1.default.sign({ userId }, secret, { expiresIn });
    }
    static async authenticate(username, password) {
        const user = await this.findByUsername(username);
        if (!user) {
            return null;
        }
        const isValidPassword = await this.validatePassword(password, user.password_hash);
        if (!isValidPassword) {
            return null;
        }
        const token = this.generateToken(user._id.toString());
        const { password_hash, ...userWithoutPassword } = user.toObject();
        return {
            user: userWithoutPassword,
            token
        };
    }
}
exports.UserService = UserService;
//# sourceMappingURL=userService.js.map