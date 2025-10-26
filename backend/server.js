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
    // No loguear cuando origin es undefined (peticiones de consola/curl sin origin)
    if (typeof origin !== 'string') origin = undefined;
    if (origin) console.log('CORS origin header:', origin);

    // Permitir requests sin Origin
    if (!origin) return callback(null, true);

    const allowed = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000,https://recurnote.xyz,https://recurnote.onrender.com')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    let hostname = origin;
    try {
      hostname = new URL(origin).hostname;
    } catch (e) {
      // Ignorar error
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
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(passport.initialize());

// Passport GitHub
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

app.get('/auth/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user.id, email: req.user.email, email_verified: req.user.email_verified },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      const nonce = crypto.randomBytes(16).toString('hex');
      const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
      
      res.set('Content-Security-Policy', `default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'self'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none';`);
      
      // Attempt to postMessage to configured origin, try www/non-www variants as fallback
      res.send(`<!DOCTYPE html>
<html>
<head>
<title>Autenticando...</title>
<meta charset="UTF-8">
</head>
<body>
<p style="text-align: center; font-family: sans-serif; margin-top: 50px;">Autenticando con GitHub...</p>
<script nonce="${nonce}">
try {
  if (window.opener && !window.opener.closed) {
    var token = '${token}';
    var targets = [];
    try { targets.push('${frontendOrigin}'); } catch(e){}
    // Add www/non-www variants to cover both forms
    try {
      var url = new URL('${frontendOrigin}');
      var host = url.hostname;
      if (host.startsWith('www.')) {
        targets.push(url.protocol + '//' + host.replace(/^www\./, ''));
      } else {
        targets.push(url.protocol + '//' + 'www.' + host);
      }
    } catch(e) {
      // ignore
    }

    var posted = false;
    for (var i = 0; i < targets.length; i++) {
      try {
        window.opener.postMessage({ token: token }, targets[i]);
        posted = true;
        break;
      } catch (err) {
        // try next
      }
    }

    // As a last resort (not recommended), attempt wildcard postMessage if nothing else worked
    if (!posted) {
      try {
        window.opener.postMessage({ token: token }, '*');
        posted = true;
      } catch (e) {
        console.warn('No se pudo enviar postMessage al opener con las variantes de origen.');
      }
    }

    setTimeout(function() { window.close(); }, 150);
  } else {
    document.body.innerHTML = '<p style="text-align: center; font-family: sans-serif;">Autenticación exitosa. Puedes cerrar esta ventana.</p>';
  }
} catch(e) {
  console.error('Error:', e);
  document.body.innerHTML = '<p style="text-align: center; font-family: sans-serif; color: red;">Error de autenticación. Cierra esta ventana.</p>';
}
</script>
</body>
</html>`);
    } catch (err) {
      console.error('Error en callback de GitHub:', err);
      res.status(500).send('Error de autenticación');
    }
  }
);

// Rutas Google
app.get('/auth/google', passport.authenticate('google', { 
  session: false, 
  scope: ['profile', 'email'] 
}));

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user.id, email: req.user.email, email_verified: req.user.email_verified },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      const nonce = crypto.randomBytes(16).toString('hex');
      const frontendOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
      
      res.set('Content-Security-Policy', `default-src 'none'; script-src 'nonce-${nonce}'; base-uri 'self'; connect-src 'self'; img-src 'self' data:; frame-ancestors 'none';`);
      
      // Attempt to postMessage to configured origin, try www/non-www variants as fallback
      res.send(`<!DOCTYPE html>
<html>
<head>
<title>Autenticando...</title>
<meta charset="UTF-8">
</head>
<body>
<p style="text-align: center; font-family: sans-serif; margin-top: 50px;">Autenticando con Google...</p>
<script nonce="${nonce}">
try {
  if (window.opener && !window.opener.closed) {
    var token = '${token}';
    var targets = [];
    try { targets.push('${frontendOrigin}'); } catch(e){}
    // Add www/non-www variants to cover both forms
    try {
      var url = new URL('${frontendOrigin}');
      var host = url.hostname;
      if (host.startsWith('www.')) {
        targets.push(url.protocol + '//' + host.replace(/^www\./, ''));
      } else {
        targets.push(url.protocol + '//' + 'www.' + host);
      }
    } catch(e) {
      // ignore
    }

    var posted = false;
    for (var i = 0; i < targets.length; i++) {
      try {
        window.opener.postMessage({ token: token }, targets[i]);
        posted = true;
        break;
      } catch (err) {
        // try next
      }
    }

    // As a last resort (not recommended), attempt wildcard postMessage if nothing else worked
    if (!posted) {
      try {
        window.opener.postMessage({ token: token }, '*');
        posted = true;
      } catch (e) {
        console.warn('No se pudo enviar postMessage al opener con las variantes de origen.');
      }
    }

    setTimeout(function() { window.close(); }, 150);
  } else {
    document.body.innerHTML = '<p style="text-align: center; font-family: sans-serif;">Autenticación exitosa. Puedes cerrar esta ventana.</p>';
  }
} catch(e) {
  console.error('Error:', e);
  document.body.innerHTML = '<p style="text-align: center; font-family: sans-serif; color: red;">Error de autenticación. Cierra esta ventana.</p>';
}
</script>
</body>
</html>`);
    } catch (err) {
      console.error('Error en callback de Google:', err);
      res.status(500).send('Error de autenticación');
    }
  }
);

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root route to reduce 404 noise
app.get('/', (req, res) => {
  res.send('Recurnote backend');
});

// Global error and signal handlers to help diagnose unexpected exits
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
  // optionally exit or keep running depending on environment
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  console.log('Ruta no encontrada:', req.method, req.path);
  res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.path,
    method: req.method
  });
});

// Conexión DB y servidor
const PORT = process.env.PORT || 5002;
connectDB().then(() => {
  const alter = process.env.NODE_ENV !== 'production';
  sequelize.sync(alter ? { alter: true } : undefined).then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`Callback URLs configuradas:`);
      console.log(`  - GitHub: ${process.env.GITHUB_CALLBACK_URL}`);
      console.log(`  - Google: ${process.env.GOOGLE_CALLBACK_URL}`);
    });
  });
}).catch(err => {
  console.error('Error al conectar con la base de datos:', err);
  process.exit(1);
});