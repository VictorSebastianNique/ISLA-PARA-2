const express = require('express');
const jwt = require('jsonwebtoken');
const { getGlobalData, getLocalData } = require('../db.cjs');
const { JWT_SECRET } = require('../middleware/auth.cjs');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const { username, password, locId } = req.body;
    
    if (!username || !password || !locId) {
      return res.status(400).json({ success: false, error: 'Faltan credenciales o sucursal' });
    }

    const globalData = await getGlobalData();
    const globalUsers = globalData.users || [];
    
    let localUsers = [];
    try {
      const localData = await getLocalData(locId);
      localUsers = localData.users || [];
    } catch (err) {
      console.error('Error fetching local users for login:', err);
    }
    
    const allUsers = [...globalUsers, ...localUsers];
    
    const user = allUsers.find(u => u.username === username && u.password === password);
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos' });
    }
    
    if (!user.active) {
      return res.status(401).json({ success: false, error: 'Usuario desactivado' });
    }
    
    if (user.role !== 'superadmin' && user.locationId !== locId) {
      return res.status(401).json({ success: false, error: 'Usuario no pertenece a esta sucursal' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role, 
        locationId: locId 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    // Remove password from user object before sending back
    const safeUser = { ...user };
    delete safeUser.password;
    
    res.json({
      success: true,
      token,
      user: safeUser
    });
    
  } catch (e) {
    next(e);
  }
});

router.get('/locations', async (req, res, next) => {
  try {
    const globalData = await getGlobalData();
    const locations = globalData.locations || [];
    res.json({ success: true, locations });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
