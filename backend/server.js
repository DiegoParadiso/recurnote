import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, sequelize } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import itemRoutes from './routes/item.routes.js';
import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import { User } from './models/user.model.js';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();

// CORS seguro
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = ['http://localhost:5173', 'http://localhost:3000', 'https://recurnote.vercel.app'];
    if (allowed.includes(origin) || origin.endsWith('.vercel.app')) return callback(null, true);
    return callback(new Error('No permitido por CORS'));
  },
  credentials: true
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
    if (!email) return done(null, false, { message: 'No se pudo obtener el email.' });

    let user = await User.findOne({ where: { email } });
    if (!user) {
      user = await User.create({
        name: profile.displayName || profile.username,
        email,
        avatar_url: profile.photos?.[0]?.value,
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

app.get('/auth/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email, email_verified: req.user.email_verified },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    // Permitir inline script SOLO para esta respuesta
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
