const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }
};

// ── Auth Schemas ─────────────────────────────────────────────
const registerSchema = z.object({
  shopName: z.string().min(2, 'Shop name must be at least 2 chars'),
  ownerName: z.string().min(2, 'Owner name must be at least 2 chars'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
  password: z.string().min(6, 'Password must be at least 6 chars'),
  address: z.string().optional(),
});

const loginSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(1),
});

// ── Product Schemas ───────────────────────────────────────────
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().optional(),
  barcode: z.string().optional(),
  purchasePrice: z.number().positive('Purchase price must be positive'),
  sellingPrice: z.number().positive('Selling price must be positive'),
  quantity: z.number().int().min(0).default(0),
  lowStockAt: z.number().int().min(0).default(5),
  expiryDate: z.string().optional().nullable(),
  unit: z.string().optional(),
}).refine(
  (d) => d.sellingPrice >= d.purchasePrice,
  { message: 'Selling price must be ≥ purchase price', path: ['sellingPrice'] }
);

// ── Bill Schemas ──────────────────────────────────────────────
const billItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
});

const billSchema = z.object({
  customerId: z.string().optional().nullable(),
  items: z.array(billItemSchema).min(1, 'Bill must have at least 1 item'),
  discountAmount: z.number().min(0).default(0),
  paymentMethod: z.enum(['CASH', 'UPI', 'CREDIT']),
  paidAmount: z.number().min(0),
});

// ── Customer Schemas ──────────────────────────────────────────
const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  phone: z.string().optional().nullable(),
});

// ── Payment Schemas ───────────────────────────────────────────
const paymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['CASH', 'UPI']).default('CASH'),
  note: z.string().optional(),
});

// ── Expense Schemas ───────────────────────────────────────────
const expenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().optional(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  productSchema,
  billSchema,
  customerSchema,
  paymentSchema,
  expenseSchema,
};
