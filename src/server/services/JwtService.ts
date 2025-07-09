import jwt from 'jsonwebtoken';
import { IAdminTokenPayload } from '../admin/IAdmin';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRATION = '24h';

export class JwtService {
    public generateToken(payload: Omit<IAdminTokenPayload, 'iat' | 'exp'>): string {
        return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
    }

    public verifyToken(token: string): IAdminTokenPayload | null {
        try {
            return jwt.verify(token, JWT_SECRET) as IAdminTokenPayload;
        } catch (error) {
            return null;
        }
    }
} 