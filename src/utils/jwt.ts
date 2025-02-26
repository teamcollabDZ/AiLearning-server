import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const generateToken = (user: User): string => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: '30d' }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET as string);
};
