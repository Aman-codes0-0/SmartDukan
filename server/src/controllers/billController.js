const prisma = require('../utils/prisma');

// POST /api/bills - Create bill with atomic stock deduction
const createBill = async (req, res) => {
  try {
    const { customerId, items, discountAmount, paymentMethod, paidAmount } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Validate items and check stock
      let totalAmount = 0;
      const enrichedItems = [];

      for (const item of items) {
        const product = await tx.product.findFirst({
          where: { id: item.productId, shopId: req.shopId },
        });
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        if (product.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.quantity}`);
        }
        const itemTotal = item.unitPrice * item.quantity;
        totalAmount += itemTotal;
        enrichedItems.push({ ...item, totalPrice: itemTotal, product });
      }

      // 2. Calculate amounts
      const discount = discountAmount || 0;
      if (discount > totalAmount) {
        throw new Error('Discount cannot exceed total bill amount');
      }
      const netAmount = totalAmount - discount;
      const creditAmount = paymentMethod === 'CREDIT' ? netAmount - paidAmount : Math.max(0, netAmount - paidAmount);
      const finalPaid = Math.min(paidAmount, netAmount);

      // 3. Validate customer for credit billing
      if (paymentMethod === 'CREDIT' && !customerId) {
        throw new Error('Customer required for credit billing');
      }

      // 4. Create bill
      const bill = await tx.bill.create({
        data: {
          shopId: req.shopId,
          customerId: customerId || null,
          totalAmount,
          discountAmount: discount,
          netAmount,
          paymentMethod,
          paidAmount: finalPaid,
          creditAmount: Math.max(0, creditAmount),
          items: {
            create: enrichedItems.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              totalPrice: i.totalPrice,
            })),
          },
        },
        include: { items: { include: { product: true } }, customer: true },
      });

      // 5. Deduct stock
      for (const item of enrichedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      // 6. Update customer balance if credit
      if (customerId && creditAmount > 0) {
        await tx.customer.update({
          where: { id: customerId },
          data: { balance: { increment: creditAmount } },
        });
      }

      return bill;
    });

    res.status(201).json({ success: true, data: result, message: 'Bill created successfully' });
  } catch (error) {
    console.error('Create bill error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to create bill' });
  }
};

// GET /api/bills
const getBills = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 20 } = req.query;
    const where = { shopId: req.shopId };

    if (startDate || endDate) {
      where.billDate = {};
      if (startDate) where.billDate.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.billDate.lte = end;
      }
    }

    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        include: { customer: true, items: { include: { product: true } } },
        orderBy: { billDate: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.bill.count({ where }),
    ]);

    res.json({ success: true, data: bills, pagination: { total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bills' });
  }
};

// GET /api/bills/:id
const getBill = async (req, res) => {
  try {
    const bill = await prisma.bill.findFirst({
      where: { id: req.params.id, shopId: req.shopId },
      include: { customer: true, items: { include: { product: true } }, shop: true },
    });
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    res.json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bill' });
  }
};

// DELETE /api/bills/:id
const deleteBill = async (req, res) => {
  try {
    const bill = await prisma.bill.findFirst({
      where: { id: req.params.id, shopId: req.shopId },
      include: { items: true },
    });
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    await prisma.$transaction(async (tx) => {
      // Restore stock
      for (const item of bill.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { increment: item.quantity } },
        });
      }
      // Restore customer balance
      if (bill.customerId && bill.creditAmount > 0) {
        await tx.customer.update({
          where: { id: bill.customerId },
          data: { balance: { decrement: bill.creditAmount } },
        });
      }
      await tx.bill.delete({ where: { id: req.params.id } });
    });

    res.json({ success: true, message: 'Bill voided successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete bill' });
  }
};

// GET /api/bills/public/:id - Public receipt view without auth
const getPublicBill = async (req, res) => {
  try {
    const bill = await prisma.bill.findUnique({
      where: { id: req.params.id },
      include: {
        customer: {
          select: { name: true, phone: true },
        },
        items: {
          include: {
            product: {
              select: { name: true, barcode: true, category: true, unit: true },
            },
          },
        },
        shop: {
          select: { name: true, ownerName: true, phone: true, address: true },
        },
      },
    });
    if (!bill) return res.status(404).json({ success: false, message: 'Receipt not found' });
    res.json({ success: true, data: bill });
  } catch (error) {
    console.error('Public bill fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch public bill receipt' });
  }
};

module.exports = { createBill, getBills, getBill, deleteBill, getPublicBill };
