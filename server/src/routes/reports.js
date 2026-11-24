const express = require('express');
const router = express.Router();
const { getDashboard, getDailyReport, getMonthlyReport, getBestSellers, getWeeklySales } = require('../controllers/reportController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/dashboard', getDashboard);
router.get('/daily', getDailyReport);
router.get('/monthly', getMonthlyReport);
router.get('/best-sellers', getBestSellers);
router.get('/weekly-sales', getWeeklySales);

module.exports = router;
