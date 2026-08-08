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

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminEmail || !adminPasswordHash) {
      return res.status(500).json({ error: 'Server authentication credentials are not configured in environment variables' });
    }

    if (email !== adminEmail) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcryptjs.compare(password, adminPasswordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (error) {
    next(error);
  }
}
