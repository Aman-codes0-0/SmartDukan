const prisma = require('../utils/prisma');

// GET /api/reports/dashboard - Today's KPIs
const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [bills, allProducts, allCustomers, todayExpenses] = await Promise.all([
      prisma.bill.findMany({
        where: { shopId: req.shopId, billDate: { gte: today, lte: todayEnd } },
        include: { items: { include: { product: true } } },
      }),
      prisma.product.findMany({ where: { shopId: req.shopId } }),
      prisma.customer.findMany({ where: { shopId: req.shopId } }),
      prisma.expense.findMany({
        where: { shopId: req.shopId, date: { gte: today, lte: todayEnd } },
      }),
    ]);

    const totalSales = bills.reduce((sum, b) => sum + b.netAmount, 0);
    const totalPaid = bills.reduce((sum, b) => sum + b.paidAmount, 0);
    const totalCredit = bills.reduce((sum, b) => sum + b.creditAmount, 0);
    const itemsSold = bills.reduce((sum, b) => sum + b.items.reduce((s, i) => s + i.quantity, 0), 0);
    const estimatedProfit = bills.reduce((sum, b) => {
      const revenue = b.netAmount;
      const cost = b.items.reduce((s, i) => s + (i.product.purchasePrice * i.quantity), 0);
      return sum + (revenue - cost);
    }, 0);

    const lowStockProducts = allProducts.filter((p) => p.quantity <= p.lowStockAt);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const expiringProducts = allProducts.filter(
      (p) => p.expiryDate && new Date(p.expiryDate) <= sevenDaysFromNow && new Date(p.expiryDate) >= new Date()
    );

    const totalOutstandingUdhaar = allCustomers.reduce((sum, c) => sum + c.balance, 0);
    const totalExpenses = todayExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Recent bills
    const recentBills = await prisma.bill.findMany({
      where: { shopId: req.shopId },
      include: { customer: true },
      orderBy: { billDate: 'desc' },
      take: 5,
    });

    res.json({
      success: true,
      data: {
        today: {
          totalSales,
          totalPaid,
          totalCredit,
          billCount: bills.length,
          itemsSold,
          estimatedProfit,
          totalExpenses,
        },
        inventory: {
          totalProducts: allProducts.length,
          lowStockCount: lowStockProducts.length,
          expiringCount: expiringProducts.length,
          lowStockProducts: lowStockProducts.slice(0, 5),
          expiringProducts: expiringProducts.slice(0, 5),
        },
        udhaar: {
          totalOutstanding: totalOutstandingUdhaar,
          totalCustomers: allCustomers.length,
          topDebtors: allCustomers.sort((a, b) => b.balance - a.balance).slice(0, 5),
        },
        recentBills,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
  }
};

// GET /api/reports/daily?date=YYYY-MM-DD
const getDailyReport = async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    date.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    const [bills, expenses] = await Promise.all([
      prisma.bill.findMany({
        where: { shopId: req.shopId, billDate: { gte: date, lte: dateEnd } },
        include: { items: { include: { product: true } }, customer: true },
      }),
      prisma.expense.findMany({
        where: { shopId: req.shopId, date: { gte: date, lte: dateEnd } },
      }),
    ]);

    const totalRevenue = bills.reduce((sum, b) => sum + b.netAmount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalCost = bills.reduce((sum, b) =>
      sum + b.items.reduce((s, i) => s + i.product.purchasePrice * i.quantity, 0), 0
    );

    res.json({
      success: true,
      data: {
        date: date.toISOString().split('T')[0],
        bills,
        expenses,
        summary: {
          totalRevenue,
          totalExpenses,
          estimatedProfit: totalRevenue - totalCost - totalExpenses,
          billCount: bills.length,
          cashCollected: bills.filter(b => b.paymentMethod !== 'CREDIT').reduce((s, b) => s + b.paidAmount, 0),
          creditGiven: bills.reduce((s, b) => s + b.creditAmount, 0),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate daily report' });
  }
};

// GET /api/reports/monthly?year=YYYY&month=MM
const getMonthlyReport = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const bills = await prisma.bill.findMany({
      where: { shopId: req.shopId, billDate: { gte: startDate, lte: endDate } },
      include: { items: { include: { product: true } } },
      orderBy: { billDate: 'asc' },
    });

    // Group by day
    const dailyData = {};
    bills.forEach((bill) => {
      const day = bill.billDate.toISOString().split('T')[0];
      if (!dailyData[day]) dailyData[day] = { date: day, revenue: 0, billCount: 0 };
      dailyData[day].revenue += bill.netAmount;
      dailyData[day].billCount += 1;
    });

    const expenses = await prisma.expense.findMany({
      where: { shopId: req.shopId, date: { gte: startDate, lte: endDate } },
    });

    res.json({
      success: true,
      data: {
        year,
        month,
        dailyData: Object.values(dailyData),
        summary: {
          totalRevenue: bills.reduce((s, b) => s + b.netAmount, 0),
          totalBills: bills.length,
          totalExpenses: expenses.reduce((s, e) => s + e.amount, 0),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate monthly report' });
  }
};

// GET /api/reports/best-sellers
const getBestSellers = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const bills = await prisma.bill.findMany({
      where: { shopId: req.shopId, billDate: { gte: startDate } },
      include: { items: { include: { product: true } } },
    });

    const productMap = {};
    bills.forEach((bill) => {
      bill.items.forEach((item) => {
        if (!productMap[item.productId]) {
          productMap[item.productId] = {
            id: item.productId,
            name: item.product.name,
            category: item.product.category,
            quantitySold: 0,
            revenue: 0,
          };
        }
        productMap[item.productId].quantitySold += item.quantity;
        productMap[item.productId].revenue += item.totalPrice;
      });
    });

    const bestSellers = Object.values(productMap)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10);

    res.json({ success: true, data: bestSellers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch best sellers' });
  }
};

// GET /api/reports/weekly-sales - last 7 days for chart (single DB query)
const getWeeklySales = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Single query instead of 7 sequential queries
    const allBills = await prisma.bill.findMany({
      where: { shopId: req.shopId, billDate: { gte: sevenDaysAgo } },
      select: { billDate: true, netAmount: true },
    });

    // Group by day in JS
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);

      const dayBills = allBills.filter(
        (b) => new Date(b.billDate) >= date && new Date(b.billDate) <= dateEnd
      );

      data.push({
        date: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        revenue: dayBills.reduce((s, b) => s + b.netAmount, 0),
        bills: dayBills.length,
      });
    }
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch weekly sales' });
  }
};

module.exports = { getDashboard, getDailyReport, getMonthlyReport, getBestSellers, getWeeklySales };
