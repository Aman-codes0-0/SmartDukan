-- Cloudflare D1 Database Schema for SmartDukan
-- 100% Free Serverless SQLite Database

DROP TABLE IF EXISTS BillItem;
DROP TABLE IF EXISTS Bill;
DROP TABLE IF EXISTS Payment;
DROP TABLE IF EXISTS Expense;
DROP TABLE IF EXISTS Product;
DROP TABLE IF EXISTS Customer;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS Shop;

-- 1. Shop Table
CREATE TABLE Shop (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  ownerName TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  address TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Table
CREATE TABLE User (
  id TEXT PRIMARY KEY,
  shopId TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  role TEXT DEFAULT 'OWNER',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shopId) REFERENCES Shop(id) ON DELETE CASCADE
);

-- 3. Product Table
CREATE TABLE Product (
  id TEXT PRIMARY KEY,
  shopId TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  barcode TEXT,
  purchasePrice REAL NOT NULL,
  sellingPrice REAL NOT NULL,
  quantity INTEGER DEFAULT 0,
  lowStockAt INTEGER DEFAULT 5,
  expiryDate DATETIME,
  unit TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shopId) REFERENCES Shop(id) ON DELETE CASCADE
);

-- 4. Customer Table
CREATE TABLE Customer (
  id TEXT PRIMARY KEY,
  shopId TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  balance REAL DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shopId) REFERENCES Shop(id) ON DELETE CASCADE
);

-- 5. Bill Table
CREATE TABLE Bill (
  id TEXT PRIMARY KEY,
  shopId TEXT NOT NULL,
  customerId TEXT,
  totalAmount REAL NOT NULL,
  discountAmount REAL DEFAULT 0,
  netAmount REAL NOT NULL,
  paymentMethod TEXT NOT NULL,
  paidAmount REAL NOT NULL,
  creditAmount REAL DEFAULT 0,
  billDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shopId) REFERENCES Shop(id) ON DELETE CASCADE,
  FOREIGN KEY (customerId) REFERENCES Customer(id)
);

-- 6. BillItem Table
CREATE TABLE BillItem (
  id TEXT PRIMARY KEY,
  billId TEXT NOT NULL,
  productId TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unitPrice REAL NOT NULL,
  totalPrice REAL NOT NULL,
  FOREIGN KEY (billId) REFERENCES Bill(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES Product(id)
);

-- 7. Payment Table
CREATE TABLE Payment (
  id TEXT PRIMARY KEY,
  customerId TEXT NOT NULL,
  amount REAL NOT NULL,
  paymentMethod TEXT DEFAULT 'CASH',
  note TEXT,
  paidAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES Customer(id) ON DELETE CASCADE
);

-- 8. Expense Table
CREATE TABLE Expense (
  id TEXT PRIMARY KEY,
  shopId TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  amount REAL NOT NULL,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shopId) REFERENCES Shop(id) ON DELETE CASCADE
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_product_shopId ON Product(shopId);
CREATE INDEX IF NOT EXISTS idx_product_barcode ON Product(barcode);
CREATE INDEX IF NOT EXISTS idx_customer_shopId ON Customer(shopId);
CREATE INDEX IF NOT EXISTS idx_customer_phone ON Customer(phone);
CREATE INDEX IF NOT EXISTS idx_bill_shopId ON Bill(shopId);
CREATE INDEX IF NOT EXISTS idx_bill_billDate ON Bill(billDate);
CREATE INDEX IF NOT EXISTS idx_billitem_billId ON BillItem(billId);
CREATE INDEX IF NOT EXISTS idx_expense_shopId ON Expense(shopId);
