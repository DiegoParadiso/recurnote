import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, sequelize } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import itemRoutes from './routes/item.routes.js';
import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from './models/user.model.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

dotenv.config();
const app = express();

// ==== CORS seguro ====
app.use(cors({
  origin: function(origin, callback) {
    // Log para depuración — revisa logs en Render o local
    console.log('CORS origin header:', origin);

    // Permitir requests sin Origin (curl, servidores, algunas extensiones)
    if (!origin) return callback(null, true);

    const allowed = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000,https://recurnote.xyz,https://recurnote.onrender.com')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    let hostname = origin;
    try {
      hostname = new URL(origin).hostname;
    } catch (e) {
    }

    const originAllowed = allowed.includes(origin)
      || allowed.includes(hostname)
      || /\.(onrender|vercel)\.app$/i.test(hostname)
      || /(^|\.)recurnote\.xyz$/i.test(hostname)
      || allowed.some(a => a === '*');

    if (originAllowed) {
      return callback(null, true);
    }

    console.warn('CORS bloqueado para origen:', origin);
    // No lanzar un Error (500) — devolver false para que no se añadan headers CORS
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Passport GitHub
app.use(passport.initialize());

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL,
  scope: ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(null, false, { message: 'No se pudo obtener el email.' });
    }
    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        name: profile.displayName || profile.username,
        email,
        avatar_url: profile.photos?.[0]?.value,
        password: crypto.randomBytes(48).toString('base64'),
        email_verified: true,
        account_status: 'active',
        preferences: {}
      });
    }
    return done(null, user);
  } catch (err) {
    done(err);
  }
}));

// Passport Google
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) return done(null, false, { message: 'No se pudo obtener el email.' });
    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        name: profile.displayName || profile.name?.givenName || email.split('@')[0],
        email,
        avatar_url: profile.photos?.[0]?.value,
        password: crypto.randomBytes(48).toString('base64'),
        email_verified: true,
        account_status: 'active',
        preferences: {}
      });
    }
    return done(null, user);
  } catch (err) {
    done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, id));

// Rutas GitHub
app.get('/auth/github', passport.authenticate('github', { session: false }));

// Rutas Google
app.get('/auth/google', passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, email_verified: req.user.email_verified },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.set('Content-Security-Policy', "script-src 'self' 'unsafe-inline'");
    res.send(`<script>window.opener.postMessage({ token: '${token}' }, '*'); window.close();</script>`);
  }
);

app.get('/auth/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, email_verified: req.user.email_verified },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.set('Content-Security-Policy', "script-src 'self' 'unsafe-inline'");
    res.send(`<script>window.opener.postMessage({ token: '${token}' }, '*'); window.close();</script>`);
  }
);

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

// Conexión DB y servidor
const PORT = process.env.PORT || 5001;
connectDB().then(() => {
  const alter = process.env.NODE_ENV !== 'production';
  sequelize.sync(alter ? { alter: true } : undefined).then(() => {
    app.listen(PORT, '0.0.0.0', () => console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`));
  });
});
