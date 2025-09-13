import { IUser } from '../models/User';
export declare class UserService {
    static findByUsername(username: string): Promise<IUser | null>;
    static findById(id: string): Promise<IUser | null>;
    static validatePassword(password: string, hash: string): Promise<boolean>;
    static generateToken(userId: string): string;
    static authenticate(username: string, password: string): Promise<{
        user: any;
        token: string;
    } | null>;
}
//# sourceMappingURL=userService.d.ts.map