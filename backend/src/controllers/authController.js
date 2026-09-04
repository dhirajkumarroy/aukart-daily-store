import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required')
});

export async function login(req, res, next) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const normalizedInputEmail = email.trim().toLowerCase();
    const configuredAdminEmail = (process.env.ADMIN_EMAIL || 'dhiraj@gmail.com').trim().toLowerCase();

    // Check if email matches configured admin email or default admin
    const isValidEmail = (normalizedInputEmail === configuredAdminEmail) || (normalizedInputEmail === 'dhiraj@gmail.com');
    if (!isValidEmail) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH || '$2a$10$tEmuP37MVg/SKCF9GNr62uS5hhDF4ytswXXG/48OQFMuNptzZvw5K';
    let isMatch = await bcryptjs.compare(password, adminPasswordHash);

    // Also support admin123 directly if hash in env differs
    if (!isMatch) {
      const fallbackHash = '$2a$10$tEmuP37MVg/SKCF9GNr62uS5hhDF4ytswXXG/48OQFMuNptzZvw5K';
      isMatch = await bcryptjs.compare(password, fallbackHash);
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { email: normalizedInputEmail },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (error) {
    next(error);
  }
}
