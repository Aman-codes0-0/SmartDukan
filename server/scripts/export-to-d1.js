const prisma = require('../src/utils/prisma');
const fs = require('fs');
const path = require('path');

function sqlVal(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return v;
  if (v instanceof Date) return `'${v.toISOString()}'`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

async function exportD1() {
  const shop = await prisma.shop.findFirst({ where: { phone: '9999988888' } });
  if (!shop) throw new Error('Shop not found');

  const users = await prisma.user.findMany({ where: { shopId: shop.id } });
  const products = await prisma.product.findMany({ where: { shopId: shop.id } });
  const customers = await prisma.customer.findMany({ where: { shopId: shop.id } });
  const expenses = await prisma.expense.findMany({ where: { shopId: shop.id } });
  const bills = await prisma.bill.findMany({ where: { shopId: shop.id }, include: { items: true } });

  let out = '-- SmartDukan Seed Data for Cloudflare D1\n-- Gullu Super Kirana Store (Phone: 9999988888, Password: test1234)\n\n';

  // Shop
  out += `INSERT INTO Shop (id, name, ownerName, phone, address, createdAt) VALUES (${sqlVal(shop.id)}, ${sqlVal(shop.name)}, ${sqlVal(shop.ownerName)}, ${sqlVal(shop.phone)}, ${sqlVal(shop.address)}, ${sqlVal(shop.createdAt)});\n\n`;

  // Users
  for (const u of users) {
    out += `INSERT INTO User (id, shopId, name, phone, passwordHash, role, createdAt) VALUES (${sqlVal(u.id)}, ${sqlVal(u.shopId)}, ${sqlVal(u.name)}, ${sqlVal(u.phone)}, ${sqlVal(u.passwordHash)}, ${sqlVal(u.role)}, ${sqlVal(u.createdAt)});\n`;
  }
  out += '\n';

  // Products
  for (const p of products) {
    out += `INSERT INTO Product (id, shopId, name, category, barcode, purchasePrice, sellingPrice, quantity, lowStockAt, expiryDate, unit, createdAt, updatedAt) VALUES (${sqlVal(p.id)}, ${sqlVal(p.shopId)}, ${sqlVal(p.name)}, ${sqlVal(p.category)}, ${sqlVal(p.barcode)}, ${sqlVal(p.purchasePrice)}, ${sqlVal(p.sellingPrice)}, ${sqlVal(p.quantity)}, ${sqlVal(p.lowStockAt)}, ${sqlVal(p.expiryDate)}, ${sqlVal(p.unit)}, ${sqlVal(p.createdAt)}, ${sqlVal(p.updatedAt)});\n`;
  }
  out += '\n';

  // Customers
  for (const c of customers) {
    out += `INSERT INTO Customer (id, shopId, name, phone, balance, createdAt) VALUES (${sqlVal(c.id)}, ${sqlVal(c.shopId)}, ${sqlVal(c.name)}, ${sqlVal(c.phone)}, ${sqlVal(c.balance)}, ${sqlVal(c.createdAt)});\n`;
  }
  out += '\n';

  // Expenses
  for (const e of expenses) {
    out += `INSERT INTO Expense (id, shopId, category, description, amount, date) VALUES (${sqlVal(e.id)}, ${sqlVal(e.shopId)}, ${sqlVal(e.category)}, ${sqlVal(e.description)}, ${sqlVal(e.amount)}, ${sqlVal(e.date)});\n`;
  }
  out += '\n';

  // Bills & BillItems
  for (const b of bills) {
    out += `INSERT INTO Bill (id, shopId, customerId, totalAmount, discountAmount, netAmount, paymentMethod, paidAmount, creditAmount, billDate) VALUES (${sqlVal(b.id)}, ${sqlVal(b.shopId)}, ${sqlVal(b.customerId)}, ${sqlVal(b.totalAmount)}, ${sqlVal(b.discountAmount)}, ${sqlVal(b.netAmount)}, ${sqlVal(b.paymentMethod)}, ${sqlVal(b.paidAmount)}, ${sqlVal(b.creditAmount)}, ${sqlVal(b.billDate)});\n`;
    for (const item of b.items) {
      out += `INSERT INTO BillItem (id, billId, productId, quantity, unitPrice, totalPrice) VALUES (${sqlVal(item.id)}, ${sqlVal(item.billId)}, ${sqlVal(item.productId)}, ${sqlVal(item.quantity)}, ${sqlVal(item.unitPrice)}, ${sqlVal(item.totalPrice)});\n`;
    }
  }

  const outPath = path.resolve(__dirname, '../../d1/seed.sql');
  fs.writeFileSync(outPath, out, 'utf8');
  console.log('Successfully generated:', outPath, 'Bytes:', out.length);
}

exportD1()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
