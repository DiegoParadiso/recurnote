import { User } from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) return res.status(400).json({ message: 'El email ya está registrado' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, preferences: {} });

    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar usuario', error: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.json({
      user: { id: user.id, name: user.name, email: user.email, is_vip: !!user.is_vip, preferences: user.preferences || {} },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: err.message });
  }
}

export async function getMe(req, res) {
  try {
    const user = req.user;
    res.json({ id: user.id, name: user.name, email: user.email, is_vip: !!user.is_vip, preferences: user.preferences || {} });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuario', error: err.message });
  }
}

export async function updatePreferences(req, res) {
  try {
    const { preferences } = req.body;
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ message: 'Preferencias inválidas' });
    }
    await req.user.update({ preferences: { ...(req.user.preferences || {}), ...preferences } });
    res.json({ preferences: req.user.preferences || {} });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar preferencias', error: err.message });
  }
}
