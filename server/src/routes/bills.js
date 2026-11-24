const express = require('express');
const router = express.Router();
const { createBill, getBills, getBill, deleteBill, getPublicBill } = require('../controllers/billController');
const auth = require('../middleware/auth');
const { validate, billSchema } = require('../middleware/validate');

// Public route for digital receipt viewing (accessible without login)
router.get('/public/:id', getPublicBill);

// Authenticated routes
router.use(auth);

router.get('/', getBills);
router.get('/:id', getBill);
router.post('/', validate(billSchema), createBill);
router.delete('/:id', deleteBill);

module.exports = router;
