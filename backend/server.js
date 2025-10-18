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

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como aplicaciones móviles o Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://recurnote.vercel.app'
    ];
    
    // Verificar si el origin está en la lista de permitidos
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // También permitir cualquier subdominio de vercel.app
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    
    return callback(new Error('No permitido por CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());

// Inicializar passport
app.use(passport.initialize());

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL,
  scope: ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = (profile.emails && profile.emails[0] && profile.emails[0].value) || null;
    const avatar = profile.photos && profile.photos[0] && profile.photos[0].value;
    if (!email) {
      return done(null, false, { message: 'No se puede obtener el email de GitHub.' });
    }
    let user = await User.findOne({ where: { email } });
    if (!user) {
      // Usuario nuevo
      user = await User.create({
        name: profile.displayName || profile.username,
        email,
        avatar_url: avatar,
        email_verified: true,
        account_status: 'active',
        preferences: {}
      });
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Serialización dummy (JWT se encarga)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, id));

// Rutas sociales GitHub
app.get('/auth/github', passport.authenticate('github', { session: false }));

app.get('/auth/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/login' }), async (req, res) => {
  // Generar el JWT
  const user = req.user;
  const token = jwt.sign({ id: user.id, email: user.email, email_verified: user.email_verified }, process.env.JWT_SECRET, { expiresIn: '24h' });
  // Aquí puedes devolver al frontend el JWT por query, cookie, o redirección interna según tus necesidades.
  // Opción segura: responder con HTML+JS para almacenarlo y redirigir
  res.send(`<script>window.opener && window.opener.postMessage({ token: '${token}' }, '*'); window.close();</script>`);
});

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  const alter = process.env.NODE_ENV !== 'production';
  sequelize.sync(alter ? { alter: true } : undefined).then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
    });
  });
});
