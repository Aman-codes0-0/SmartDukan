const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Dummy Account Seeding for Gullu Super Kirana Store ---');

  const DUMMY_PHONE = '9999988888';
  const PASSWORD = 'test1234';
  const SHOP_NAME = 'Gullu Super Kirana Store';
  const OWNER_NAME = 'Gullu';

  // 1. Cleanup existing records for this phone if any
  const existingUser = await prisma.user.findUnique({
    where: { phone: DUMMY_PHONE },
  });

  if (existingUser) {
    console.log(`Found existing user with phone ${DUMMY_PHONE}. Cleaning up existing shop...`);
    await prisma.shop.delete({
      where: { id: existingUser.shopId },
    });
    console.log('Cleaned up previous shop & data.');
  }

  // 2. Create Shop
  const shop = await prisma.shop.create({
    data: {
      name: SHOP_NAME,
      ownerName: OWNER_NAME,
      phone: DUMMY_PHONE,
      address: 'Shop #14, Main Market, Ward 5, New Delhi',
    },
  });
  console.log(`✓ Created Shop: ${shop.name} (ID: ${shop.id})`);

  // 3. Create User with hashed password
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const user = await prisma.user.create({
    data: {
      shopId: shop.id,
      name: OWNER_NAME,
      phone: DUMMY_PHONE,
      passwordHash,
      role: 'OWNER',
    },
  });
  console.log(`✓ Created Owner Account: ${user.name} (${user.phone})`);

  // Helper date generators
  const now = new Date();
  const inDays = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
  const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

  // 4. Products Catalog (38 Items across all 10 categories)
  const productsData = [
    // A. Atta, Flours & Sooji
    {
      name: 'Aashirvaad Shudh Chakki Atta (5 kg)',
      category: 'Atta, Flours & Sooji',
      barcode: '8901030383921',
      purchasePrice: 210.0,
      sellingPrice: 245.0,
      quantity: 25,
      lowStockAt: 5,
      unit: 'Pack',
      expiryDate: inDays(180),
    },
    {
      name: 'Fortune Maida Refined Wheat Flour (1 kg)',
      category: 'Atta, Flours & Sooji',
      barcode: '8906007281023',
      purchasePrice: 38.0,
      sellingPrice: 48.0,
      quantity: 30,
      lowStockAt: 5,
      unit: 'Pack',
      expiryDate: inDays(150),
    },
    {
      name: 'Rajdhani Sooji / Semolina (500 g)',
      category: 'Atta, Flours & Sooji',
      barcode: '8906012480112',
      purchasePrice: 28.0,
      sellingPrice: 36.0,
      quantity: 20,
      lowStockAt: 5,
      unit: 'Pack',
      expiryDate: inDays(120),
    },
    {
      name: 'Tata Sampann Besan (500 g)',
      category: 'Atta, Flours & Sooji',
      barcode: '8901058852331',
      purchasePrice: 52.0,
      sellingPrice: 65.0,
      quantity: 18,
      lowStockAt: 5,
      unit: 'Pack',
      expiryDate: inDays(140),
    },

    // B. Dals & Pulses
    {
      name: 'Tata Sampann Unpolished Toor Dal (1 kg)',
      category: 'Dals & Pulses',
      barcode: '8901058847115',
      purchasePrice: 145.0,
      sellingPrice: 175.0,
      quantity: 35,
      lowStockAt: 5,
      unit: 'Pack',
      expiryDate: inDays(240),
    },
    {
      name: 'Fortune Moong Dal Dhuli (1 kg)',
      category: 'Dals & Pulses',
      barcode: '8906007282051',
      purchasePrice: 110.0,
      sellingPrice: 135.0,
      quantity: 22,
      lowStockAt: 5,
      unit: 'Pack',
      expiryDate: inDays(200),
    },
    {
      name: 'Rajdhani Chana Dal (1 kg)',
      category: 'Dals & Pulses',
      barcode: '8906012480358',
      purchasePrice: 85.0,
      sellingPrice: 105.0,
      quantity: 24,
      lowStockAt: 5,
      unit: 'Pack',
      expiryDate: inDays(180),
    },
    {
      name: 'Premium Rajma Chitra (500 g)',
      category: 'Dals & Pulses',
      barcode: '8906012480488',
      purchasePrice: 70.0,
      sellingPrice: 88.0,
      quantity: 15,
      lowStockAt: 5,
      unit: 'Pack',
      expiryDate: inDays(210),
    },

    // C. Edible Oils, Ghee & Spices
    {
      name: 'Fortune Sunlite Refined Sunflower Oil (1 L Pouch)',
      category: 'Edible Oils & Spices',
      barcode: '8906007280019',
      purchasePrice: 115.0,
      sellingPrice: 138.0,
      quantity: 40,
      lowStockAt: 8,
      unit: 'Litre',
      expiryDate: inDays(270),
    },
    {
      name: 'Fortune Kachi Ghani Mustard Oil (1 L Bottle)',
      category: 'Edible Oils & Spices',
      barcode: '8906007280156',
      purchasePrice: 132.0,
      sellingPrice: 155.0,
      quantity: 30,
      lowStockAt: 6,
      unit: 'Litre',
      expiryDate: inDays(270),
    },
    {
      name: 'Amul Pure Cow Ghee (1 L Tin)',
      category: 'Edible Oils & Spices',
      barcode: '8901262010156',
      purchasePrice: 540.0,
      sellingPrice: 615.0,
      quantity: 12,
      lowStockAt: 3,
      unit: 'Pack',
      expiryDate: inDays(300),
    },
    {
      name: 'Tata Salt Vacuum Evaporated (1 kg)',
      category: 'Edible Oils & Spices',
      barcode: '8901058852119',
      purchasePrice: 22.0,
      sellingPrice: 28.0,
      quantity: 60,
      lowStockAt: 10,
      unit: 'Pack',
      expiryDate: inDays(365),
    },
    {
      name: 'MDH Deggi Mirch Powder (100 g)',
      category: 'Edible Oils & Spices',
      barcode: '8901082001125',
      purchasePrice: 68.0,
      sellingPrice: 82.0,
      quantity: 25,
      lowStockAt: 5,
      unit: 'Pack',
      expiryDate: inDays(180),
    },
    {
      name: 'Everest Garam Masala (100 g)',
      category: 'Edible Oils & Spices',
      barcode: '8901082002139',
      purchasePrice: 72.0,
      sellingPrice: 88.0,
      quantity: 20,
      lowStockAt: 5,
      unit: 'Pack',
      expiryDate: inDays(180),
    },
    {
      name: 'Catch Turmeric / Haldi Powder (200 g)',
      category: 'Edible Oils & Spices',
      barcode: '8901082003150',
      purchasePrice: 42.0,
      sellingPrice: 52.0,
      quantity: 25,
      lowStockAt: 5,
      unit: 'Pack',
      expiryDate: inDays(240),
    },

    // D. Dairy Products (Includes Near-Expiry test items)
    {
      name: 'Amul Butter Pasteurised (100 g)',
      category: 'Dairy',
      barcode: '8901262010019',
      purchasePrice: 48.0,
      sellingPrice: 58.0,
      quantity: 30,
      lowStockAt: 6,
      unit: 'Piece',
      expiryDate: inDays(45),
    },
    {
      name: 'Amul Taaza Homogenised Toned Milk (1 L)',
      category: 'Dairy',
      barcode: '8901262020056',
      purchasePrice: 64.0,
      sellingPrice: 74.0,
      quantity: 16,
      lowStockAt: 5,
      unit: 'Piece',
      expiryDate: inDays(60),
    },
    {
      name: 'Mother Dairy Classic Paneer (200 g)',
      category: 'Dairy',
      barcode: '8901648001024',
      purchasePrice: 75.0,
      sellingPrice: 92.0,
      quantity: 8,
      lowStockAt: 4,
      unit: 'Pack',
      expiryDate: inDays(4), // Expiring in 4 days (Expiring soon test)
    },
    {
      name: 'Amul Masti Dahi Cup (400 g)',
      category: 'Dairy',
      barcode: '8901262030086',
      purchasePrice: 36.0,
      sellingPrice: 45.0,
      quantity: 14,
      lowStockAt: 4,
      unit: 'Piece',
      expiryDate: inDays(5), // Expiring in 5 days (Expiring soon test)
    },

    // E. Snacks, Biscuits & Noodles (Includes Low-Stock test items)
    {
      name: 'Parle-G Gold Glucose Biscuits (1 kg)',
      category: 'Snacks & Biscuits',
      barcode: '8901719101015',
      purchasePrice: 88.0,
      sellingPrice: 105.0,
      quantity: 25,
      lowStockAt: 5,
      unit: 'Pack',
      expiryDate: inDays(150),
    },
    {
      name: 'Britannia Good Day Butter Cookies (200 g)',
      category: 'Snacks & Biscuits',
      barcode: '8901063102025',
      purchasePrice: 35.0,
      sellingPrice: 45.0,
      quantity: 30,
      lowStockAt: 5,
      unit: 'Pack',
      expiryDate: inDays(120),
    },
    {
      name: 'Maggi 2-Minute Masala Noodles (4-Pack 280 g)',
      category: 'Snacks & Biscuits',
      barcode: '8901058863016',
      purchasePrice: 52.0,
      sellingPrice: 60.0,
      quantity: 50,
      lowStockAt: 8,
      unit: 'Pack',
      expiryDate: inDays(210),
    },
    {
      name: "Lay's India's Magic Masala Chips (50 g)",
      category: 'Snacks & Biscuits',
      barcode: '8901491101018',
      purchasePrice: 16.0,
      sellingPrice: 20.0,
      quantity: 40,
      lowStockAt: 8,
      unit: 'Piece',
      expiryDate: inDays(90),
    },
    {
      name: "Haldiram's Nagpur Bhujia Sev (400 g)",
      category: 'Snacks & Biscuits',
      barcode: '8904004401052',
      purchasePrice: 98.0,
      sellingPrice: 120.0,
      quantity: 2, // Low stock test (< 5)
      lowStockAt: 5,
      unit: 'Pack',
      expiryDate: inDays(140),
    },
    {
      name: 'Kurkure Masala Munch (90 g)',
      category: 'Snacks & Biscuits',
      barcode: '8901491102022',
      purchasePrice: 16.0,
      sellingPrice: 20.0,
      quantity: 3, // Low stock test (< 5)
      lowStockAt: 5,
      unit: 'Piece',
      expiryDate: inDays(90),
    },

    // F. Beverages
    {
      name: 'Brooke Bond Red Label Tea (500 g)',
      category: 'Beverages',
      barcode: '8901030384119',
      purchasePrice: 230.0,
      sellingPrice: 275.0,
      quantity: 20,
      lowStockAt: 5,
      unit: 'Pack',
      expiryDate: inDays(365),
    },
    {
      name: 'Tata Tea Gold (500 g)',
      category: 'Beverages',
      barcode: '8901058848020',
      purchasePrice: 290.0,
      sellingPrice: 340.0,
      quantity: 15,
      lowStockAt: 4,
      unit: 'Pack',
      expiryDate: inDays(365),
    },
    {
      name: 'Nescafé Classic Instant Coffee Glass Jar (50 g)',
      category: 'Beverages',
      barcode: '8901058859019',
      purchasePrice: 165.0,
      sellingPrice: 195.0,
      quantity: 12,
      lowStockAt: 3,
      unit: 'Piece',
      expiryDate: inDays(300),
    },
    {
      name: "Frooti Fresh 'N' Juicy Mango Drink (1.2 L)",
      category: 'Beverages',
      barcode: '8901719201050',
      purchasePrice: 60.0,
      sellingPrice: 75.0,
      quantity: 18,
      lowStockAt: 4,
      unit: 'Piece',
      expiryDate: inDays(180),
    },

    // G. Dry Fruits
    {
      name: 'Vedaka Popular Whole California Almonds (500 g)',
      category: 'Dry Fruits',
      barcode: '8906007284017',
      purchasePrice: 310.0,
      sellingPrice: 380.0,
      quantity: 14,
      lowStockAt: 3,
      unit: 'Pack',
      expiryDate: inDays(240),
    },
    {
      name: 'Nutraj Golden Raisins / Kismis (250 g)',
      category: 'Dry Fruits',
      barcode: '8906012480884',
      purchasePrice: 85.0,
      sellingPrice: 110.0,
      quantity: 16,
      lowStockAt: 3,
      unit: 'Pack',
      expiryDate: inDays(200),
    },
    {
      name: 'Tata Sampann Whole Cashews W320 (200 g)',
      category: 'Dry Fruits',
      barcode: '8901058872018',
      purchasePrice: 195.0,
      sellingPrice: 235.0,
      quantity: 10,
      lowStockAt: 3,
      unit: 'Pack',
      expiryDate: inDays(210),
    },

    // H. Personal Care
    {
      name: 'Dettol Original Bathing Soap (4x125 g Multipack)',
      category: 'Personal Care',
      barcode: '8901396112025',
      purchasePrice: 155.0,
      sellingPrice: 185.0,
      quantity: 20,
      lowStockAt: 4,
      unit: 'Pack',
      expiryDate: inDays(700),
    },
    {
      name: 'Colgate Strong Teeth Toothpaste (200 g)',
      category: 'Personal Care',
      barcode: '8901314010014',
      purchasePrice: 92.0,
      sellingPrice: 112.0,
      quantity: 25,
      lowStockAt: 5,
      unit: 'Piece',
      expiryDate: inDays(500),
    },
    {
      name: 'Clinic Plus Strong & Long Shampoo (340 ml)',
      category: 'Personal Care',
      barcode: '8901030385055',
      purchasePrice: 175.0,
      sellingPrice: 215.0,
      quantity: 15,
      lowStockAt: 3,
      unit: 'Piece',
      expiryDate: inDays(600),
    },

    // I. Household Cleaning
    {
      name: 'Surf Excel Easy Wash Detergent Powder (1 kg)',
      category: 'Household',
      barcode: '8901030386021',
      purchasePrice: 125.0,
      sellingPrice: 145.0,
      quantity: 28,
      lowStockAt: 5,
      unit: 'Pack',
      expiryDate: inDays(700),
    },
    {
      name: 'Vim Dishwash Bar (300 g)',
      category: 'Household',
      barcode: '8901030387011',
      purchasePrice: 24.0,
      sellingPrice: 30.0,
      quantity: 40,
      lowStockAt: 8,
      unit: 'Piece',
      expiryDate: inDays(500),
    },
    {
      name: 'Harpic Power Plus Toilet Cleaner (500 ml)',
      category: 'Household',
      barcode: '8901396331013',
      purchasePrice: 80.0,
      sellingPrice: 98.0,
      quantity: 20,
      lowStockAt: 4,
      unit: 'Piece',
      expiryDate: inDays(600),
    },
  ];

  const createdProducts = [];
  for (const item of productsData) {
    const p = await prisma.product.create({
      data: {
        shopId: shop.id,
        ...item,
      },
    });
    createdProducts.push(p);
  }
  console.log(`✓ Seeded ${createdProducts.length} inventory products across all categories.`);

  // 5. Sample Customers with Udhaar Balances
  const customersData = [
    { name: 'Sunil Verma', phone: '9811122233', balance: 1850.0 },
    { name: 'Pooja Gupta', phone: '9822233344', balance: 640.0 },
    { name: 'Vikram Singh', phone: '9833344455', balance: 2400.0 },
    { name: 'Amitabh Saxena', phone: '9844455566', balance: 0.0 },
  ];

  const createdCustomers = [];
  for (const c of customersData) {
    const cust = await prisma.customer.create({
      data: {
        shopId: shop.id,
        ...c,
      },
    });
    createdCustomers.push(cust);
  }
  console.log(`✓ Seeded ${createdCustomers.length} customer records with realistic balances.`);

  // 6. Sample Past Payments for Customers
  await prisma.payment.create({
    data: {
      customerId: createdCustomers[0].id,
      amount: 500.0,
      paymentMethod: 'CASH',
      note: 'Partial payment received in cash',
      paidAt: daysAgo(2),
    },
  });

  await prisma.payment.create({
    data: {
      customerId: createdCustomers[2].id,
      amount: 1000.0,
      paymentMethod: 'UPI',
      note: 'UPI transfer on GPay',
      paidAt: daysAgo(3),
    },
  });

  // 7. Seed Past 7 Days of Sample Bills
  const sampleBillConfigs = [
    {
      days: 6,
      method: 'CASH',
      items: [
        { prodIndex: 0, qty: 1 }, // Atta
        { prodIndex: 11, qty: 2 }, // Salt
      ],
      discount: 0,
      paid: true,
    },
    {
      days: 5,
      method: 'UPI',
      items: [
        { prodIndex: 8, qty: 2 }, // Sunflower Oil
        { prodIndex: 21, qty: 4 }, // Maggi
        { prodIndex: 15, qty: 2 }, // Butter
      ],
      discount: 20,
      paid: true,
    },
    {
      days: 5,
      method: 'CREDIT',
      customerId: createdCustomers[0].id,
      items: [
        { prodIndex: 4, qty: 2 }, // Toor Dal
        { prodIndex: 9, qty: 1 }, // Mustard Oil
        { prodIndex: 12, qty: 1 }, // MDH Mirch
      ],
      discount: 0,
      paid: false,
      credit: 587.0,
    },
    {
      days: 4,
      method: 'CASH',
      items: [
        { prodIndex: 19, qty: 2 }, // Parle-G
        { prodIndex: 25, qty: 1 }, // Red Label Tea
        { prodIndex: 16, qty: 2 }, // Milk
      ],
      discount: 10,
      paid: true,
    },
    {
      days: 3,
      method: 'UPI',
      items: [
        { prodIndex: 10, qty: 1 }, // Cow Ghee
        { prodIndex: 29, qty: 1 }, // California Almonds
      ],
      discount: 25,
      paid: true,
    },
    {
      days: 3,
      method: 'CREDIT',
      customerId: createdCustomers[2].id,
      items: [
        { prodIndex: 35, qty: 2 }, // Surf Excel
        { prodIndex: 32, qty: 1 }, // Dettol Soap
        { prodIndex: 33, qty: 1 }, // Colgate
      ],
      discount: 0,
      paid: false,
      credit: 587.0,
    },
    {
      days: 2,
      method: 'CASH',
      items: [
        { prodIndex: 22, qty: 3 }, // Lays
        { prodIndex: 28, qty: 2 }, // Frooti
        { prodIndex: 20, qty: 2 }, // Good Day
      ],
      discount: 0,
      paid: true,
    },
    {
      days: 1,
      method: 'UPI',
      items: [
        { prodIndex: 0, qty: 2 }, // Atta
        { prodIndex: 4, qty: 1 }, // Toor Dal
        { prodIndex: 8, qty: 1 }, // Sunflower Oil
      ],
      discount: 30,
      paid: true,
    },
    {
      days: 0, // Today
      method: 'CASH',
      items: [
        { prodIndex: 15, qty: 2 }, // Butter
        { prodIndex: 16, qty: 2 }, // Milk
        { prodIndex: 11, qty: 1 }, // Salt
      ],
      discount: 0,
      paid: true,
    },
    {
      days: 0, // Today
      method: 'UPI',
      items: [
        { prodIndex: 25, qty: 2 }, // Tea
        { prodIndex: 27, qty: 1 }, // Nescafe
        { prodIndex: 19, qty: 1 }, // Parle-G
      ],
      discount: 15,
      paid: true,
    },
  ];

  let billCount = 0;
  for (const b of sampleBillConfigs) {
    let totalAmt = 0;
    const billItemsData = [];

    for (const it of b.items) {
      const prod = createdProducts[it.prodIndex];
      const itemTotal = prod.sellingPrice * it.qty;
      totalAmt += itemTotal;
      billItemsData.push({
        productId: prod.id,
        quantity: it.qty,
        unitPrice: prod.sellingPrice,
        totalPrice: itemTotal,
      });
    }

    const netAmt = Math.max(0, totalAmt - b.discount);
    const paidAmt = b.paid ? netAmt : 0;
    const creditAmt = b.paid ? 0 : netAmt;

    const bill = await prisma.bill.create({
      data: {
        shopId: shop.id,
        customerId: b.customerId || null,
        totalAmount: totalAmt,
        discountAmount: b.discount,
        netAmount: netAmt,
        paymentMethod: b.method,
        paidAmount: paidAmt,
        creditAmount: creditAmt,
        billDate: daysAgo(b.days),
        items: {
          create: billItemsData,
        },
      },
    });
    billCount++;
  }
  console.log(`✓ Seeded ${billCount} past bills across Cash, UPI, and Udhaar.`);

  // 8. Sample Expenses for Net Profit Calculation
  const expensesData = [
    { category: 'Electricity', description: 'Store electricity bill - BSES', amount: 1850.0, days: 5 },
    { category: 'Rent', description: 'Main Market Shop Monthly Rent', amount: 8000.0, days: 10 },
    { category: 'Transport', description: 'Tempo tempo delivery from Azadpur Mandi', amount: 450.0, days: 2 },
    { category: 'Miscellaneous', description: 'Polybags, thermal paper rolls, packing tape', amount: 320.0, days: 1 },
  ];

  for (const exp of expensesData) {
    await prisma.expense.create({
      data: {
        shopId: shop.id,
        category: exp.category,
        description: exp.description,
        amount: exp.amount,
        date: daysAgo(exp.days),
      },
    });
  }
  console.log(`✓ Seeded ${expensesData.length} store expense records.`);

  console.log('\n======================================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('Shop Name: ' + SHOP_NAME);
  console.log('Login Phone: ' + DUMMY_PHONE);
  console.log('Login Password: ' + PASSWORD);
  console.log('Inventory: ' + createdProducts.length + ' products');
  console.log('Customers: ' + createdCustomers.length + ' customers');
  console.log('Bills: ' + billCount + ' bills');
  console.log('======================================================\n');
}

main()
  .catch((e) => {
    console.error('Error seeding dummy account:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
