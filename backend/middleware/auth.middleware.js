import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token no proporcionado' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      console.warn('authMiddleware: token verificado pero sin id:', decoded);
      return res.status(401).json({ message: 'Token inválido' });
    }

    try {
      req.user = await User.findByPk(decoded.id);
    } catch (dbErr) {
      console.error('authMiddleware: error buscando usuario en DB:', dbErr);
      return res.status(500).json({ message: 'Error interno al validar usuario' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    next();
  } catch {
    console.warn('authMiddleware: jwt.verify falló o token inválido');
    res.status(401).json({ message: 'Token inválido' });
  }
}
