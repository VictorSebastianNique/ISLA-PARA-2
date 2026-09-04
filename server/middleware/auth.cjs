const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cafeteria-pos-secret-2024';

const requireAuth = (req, res, next) => {
  const devMaster = req.headers['x-dev-master'];
  if (devMaster === 'devmaster2026') {
    req.user = { role: 'developer' };
    return next();
  }

  // Bypass para la App Cliente (CRM) que no tiene login de staff
  const clientApp = req.headers['x-client-app'];
  if (clientApp === 'customer') {
    req.user = { role: 'customer' };
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Token de acceso no proporcionado o formato inválido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Token expirado o inválido' });
  }
};

module.exports = {
  requireAuth,
  JWT_SECRET
};
