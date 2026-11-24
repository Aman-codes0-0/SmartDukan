const express = require('express');
const router = express.Router();
const { getExpenses, createExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const auth = require('../middleware/auth');
const { validate, expenseSchema } = require('../middleware/validate');

router.use(auth);

router.get('/', getExpenses);
router.post('/', validate(expenseSchema), createExpense);
router.put('/:id', validate(expenseSchema), updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
