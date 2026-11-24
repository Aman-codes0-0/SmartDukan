const prisma = require('../utils/prisma');

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const { search, category, lowStock, expiring, page, limit } = req.query;
    const where = { shopId: req.shopId };

    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (category) where.category = { equals: category, mode: 'insensitive' };

    const queryOptions = {
      where,
      orderBy: { createdAt: 'desc' },
    };

    if (page && limit) {
      queryOptions.skip = (parseInt(page) - 1) * parseInt(limit);
      queryOptions.take = parseInt(limit);
    }

    let [products, total] = await Promise.all([
      prisma.product.findMany(queryOptions),
      prisma.product.count({ where }),
    ]);

    // Filter expiring products in JS (within 7 days)
    if (expiring === 'true') {
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      products = products.filter(
        (p) => p.expiryDate && new Date(p.expiryDate) <= sevenDaysFromNow
      );
    }

    // Filter low-stock in JS — compares each product against its own threshold
    if (lowStock === 'true') {
      products = products.filter((p) => p.quantity <= p.lowStockAt);
    }

    const response = { success: true, data: products };
    if (page && limit) {
      response.pagination = { total, page: parseInt(page), limit: parseInt(limit) };
    }
    res.json(response);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

// GET /api/products/low-stock
const getLowStockProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { shopId: req.shopId },
    });
    const lowStock = products.filter((p) => p.quantity <= p.lowStockAt);
    res.json({ success: true, data: lowStock });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch low stock' });
  }
};

// GET /api/products/expiring
const getExpiringProducts = async (req, res) => {
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const products = await prisma.product.findMany({
      where: {
        shopId: req.shopId,
        expiryDate: { lte: sevenDaysFromNow, gte: new Date() },
      },
    });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch expiring products' });
  }
};

// GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, shopId: req.shopId },
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, category, barcode, purchasePrice, sellingPrice, quantity, lowStockAt, expiryDate, unit } = req.body;
    const product = await prisma.product.create({
      data: {
        shopId: req.shopId,
        name,
        category,
        barcode,
        purchasePrice,
        sellingPrice,
        quantity: quantity || 0,
        lowStockAt: lowStockAt || 5,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        unit,
      },
    });
    res.status(201).json({ success: true, data: product, message: 'Product added successfully' });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const existing = await prisma.product.findFirst({
      where: { id: req.params.id, shopId: req.shopId },
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });

    const { name, category, barcode, purchasePrice, sellingPrice, quantity, lowStockAt, expiryDate, unit } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        category,
        barcode,
        purchasePrice,
        sellingPrice,
        quantity,
        lowStockAt,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        unit,
      },
    });
    res.json({ success: true, data: product, message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const existing = await prisma.product.findFirst({
      where: { id: req.params.id, shopId: req.shopId },
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Product not found' });

    // Block delete if product is referenced in any bills
    const billItemCount = await prisma.billItem.count({
      where: { productId: req.params.id },
    });
    if (billItemCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete — this product is used in ${billItemCount} bill(s). Set stock to 0 to mark it inactive instead.`,
      });
    }

    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

module.exports = { getProducts, getProduct, getLowStockProducts, getExpiringProducts, createProduct, updateProduct, deleteProduct };
