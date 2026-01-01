import jwt from 'jsonwebtoken';
import { config } from '../config/environment';

export interface JwtPayload {
  id: string;
  email: string;
  username: string;
}

// Generate JWT token
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(
    payload,
    config.jwtSecret as jwt.Secret,
    {
      expiresIn: config.jwtExpiry,
    } as jwt.SignOptions
  );
};

// Verify JWT token
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwtSecret as jwt.Secret) as JwtPayload;
};

// Decode JWT token without verification
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    return null;
  }
};