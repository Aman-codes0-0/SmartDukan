const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { shopName, ownerName, phone, password, address } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const shop = await tx.shop.create({
        data: { name: shopName, ownerName, phone, address },
      });
      const user = await tx.user.create({
        data: { shopId: shop.id, name: ownerName, phone, passwordHash, role: 'OWNER' },
      });
      return { shop, user };
    });

    const token = generateToken(result.user.id);
    res.status(201).json({
      success: true,
      message: 'Shop registered successfully',
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        phone: result.user.phone,
        role: result.user.role,
        shop: { id: result.shop.id, name: result.shop.name },
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { phone },
      include: { shop: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }

    const token = generateToken(user.id);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        shop: { id: user.shop.id, name: user.shop.name, address: user.shop.address },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      name: req.user.name,
      phone: req.user.phone,
      role: req.user.role,
      shop: {
        id: req.user.shop.id,
        name: req.user.shop.name,
        address: req.user.shop.address,
        ownerName: req.user.shop.ownerName,
      },
    },
  });
};

module.exports = { register, login, getMe };
