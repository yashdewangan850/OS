import jwt from 'jsonwebtoken';
export function makeToken(user, secret) {
  return jwt.sign({ id: String(user._id || user.id), email: user.email, name: user.name }, secret, { expiresIn: '1d' });
}
