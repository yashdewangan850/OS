import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { makeToken } from '../services/tokenService.js';

export function createAuthController({ jwtSecret, users }) {
  return {
    register: async (req, res) => {
      const name = String(req.body.name || '').trim();
      const email = String(req.body.email || '').trim().toLowerCase();
      const password = String(req.body.password || '');
      if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6) return res.status(400).json({ message: 'Name, valid email and password (6+ characters) are required.' });
      try {
        if (mongoose.connection.readyState === 1) {
          if (await User.exists({ email })) return res.status(409).json({ message: 'An account with this email already exists.' });
          const passwordHash = await bcrypt.hash(password, 12);
          const user = await User.create({ name, email, passwordHash });
          return res.status(201).json({ token: makeToken(user, jwtSecret), user: { id: String(user._id), name, email } });
        }
        if (users.has(email)) return res.status(409).json({ message: 'An account with this email already exists.' });
        const passwordHash = await bcrypt.hash(password, 12);
        const user = { id: crypto.randomUUID(), name, email, passwordHash };
        users.set(email, user);
        return res.status(201).json({ token: makeToken(user, jwtSecret), user: { id: user.id, name, email } });
      } catch (error) { return res.status(500).json({ message: 'Registration failed.', error: error.message }); }
    },
    login: async (req, res) => {
      const email = String(req.body.email || '').trim().toLowerCase();
      const password = String(req.body.password || '');
      try {
        const user = mongoose.connection.readyState === 1 ? await User.findOne({ email }) : users.get(email);
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password.' });
        return res.json({ token: makeToken(user, jwtSecret), user: { id: String(user._id || user.id), name: user.name, email: user.email } });
      } catch (error) { return res.status(500).json({ message: 'Login failed.', error: error.message }); }
    },
    me: async (req, res) => {
      if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(req.user.id)) {
        const user = await User.findById(req.user.id).select('_id name email');
        if (user) return res.json({ user: { id: String(user._id), name: user.name, email: user.email } });
      }
      return res.json({ user: req.user });
    }
  };
}
