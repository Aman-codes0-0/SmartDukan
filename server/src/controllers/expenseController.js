const prisma = require('../utils/prisma');

// GET /api/expenses
const getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const where = { shopId: req.shopId };
    if (category) where.category = { equals: category, mode: 'insensitive' };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }
    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });
    res.json({ success: true, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch expenses' });
  }
};

// POST /api/expenses
const createExpense = async (req, res) => {
  try {
    const { category, description, amount, date } = req.body;
    const expense = await prisma.expense.create({
      data: { shopId: req.shopId, category, description, amount, date: date ? new Date(date) : new Date() },
    });
    res.status(201).json({ success: true, data: expense, message: 'Expense added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create expense' });
  }
};

// PUT /api/expenses/:id
const updateExpense = async (req, res) => {
  try {
    const existing = await prisma.expense.findFirst({
      where: { id: req.params.id, shopId: req.shopId },
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Expense not found' });

    const { category, description, amount, date } = req.body;
    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: { category, description, amount, date: date ? new Date(date) : undefined },
    });
    res.json({ success: true, data: expense, message: 'Expense updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update expense' });
  }
};

// DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
  try {
    const existing = await prisma.expense.findFirst({
      where: { id: req.params.id, shopId: req.shopId },
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Expense not found' });

    await prisma.expense.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete expense' });
  }
};

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };
