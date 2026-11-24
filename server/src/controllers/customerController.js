const prisma = require('../utils/prisma');

// GET /api/customers
const getCustomers = async (req, res) => {
  try {
    const { search, page, limit } = req.query;
    const where = { shopId: req.shopId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }
    const queryOptions = {
      where,
      orderBy: { balance: 'desc' },
    };
    if (page && limit) {
      queryOptions.skip = (parseInt(page) - 1) * parseInt(limit);
      queryOptions.take = parseInt(limit);
    }
    const [customers, total] = await Promise.all([
      prisma.customer.findMany(queryOptions),
      prisma.customer.count({ where }),
    ]);
    const response = { success: true, data: customers };
    if (page && limit) {
      response.pagination = { total, page: parseInt(page), limit: parseInt(limit) };
    }
    res.json(response);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
};

// GET /api/customers/:id
const getCustomer = async (req, res) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: { id: req.params.id, shopId: req.shopId },
      include: {
        bills: { orderBy: { billDate: 'desc' }, take: 50, include: { items: { include: { product: true } } } },
        payments: { orderBy: { paidAt: 'desc' }, take: 50 },
      },
    });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer' });
  }
};

// POST /api/customers
const createCustomer = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const customer = await prisma.customer.create({
      data: { shopId: req.shopId, name, phone },
    });
    res.status(201).json({ success: true, data: customer, message: 'Customer added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create customer' });
  }
};

// PUT /api/customers/:id
const updateCustomer = async (req, res) => {
  try {
    const existing = await prisma.customer.findFirst({
      where: { id: req.params.id, shopId: req.shopId },
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Customer not found' });

    const { name, phone } = req.body;
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: { name, phone },
    });
    res.json({ success: true, data: customer, message: 'Customer updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update customer' });
  }
};

// POST /api/customers/:id/payments
const recordPayment = async (req, res) => {
  try {
    const { amount, paymentMethod, note } = req.body;
    const customer = await prisma.customer.findFirst({
      where: { id: req.params.id, shopId: req.shopId },
    });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    if (Math.round(amount * 100) > Math.round(customer.balance * 100)) {
      return res.status(400).json({ success: false, message: `Payment exceeds balance (₹${customer.balance})` });
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: { customerId: customer.id, amount, paymentMethod: paymentMethod || 'CASH', note },
      });
      const updated = await tx.customer.update({
        where: { id: customer.id },
        data: { balance: { decrement: amount } },
      });
      return { payment, customer: updated };
    });

    res.status(201).json({ success: true, data: result, message: 'Payment recorded successfully' });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to record payment' });
  }
};

// GET /api/customers/:id/payments
const getPayments = async (req, res) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: { id: req.params.id, shopId: req.shopId },
    });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    const payments = await prisma.payment.findMany({
      where: { customerId: req.params.id },
      orderBy: { paidAt: 'desc' },
    });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, recordPayment, getPayments };
