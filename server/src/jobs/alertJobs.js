const cron = require('node-cron');
const prisma = require('../utils/prisma');

const checkLowStockAndExpiry = async () => {
  try {
    const shops = await prisma.shop.findMany({ include: { users: { where: { role: 'OWNER' } } } });

    for (const shop of shops) {
      const products = await prisma.product.findMany({ where: { shopId: shop.id } });

      const lowStockProducts = products.filter((p) => p.quantity <= p.lowStockAt);
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      const expiringProducts = products.filter(
        (p) => p.expiryDate && new Date(p.expiryDate) <= sevenDaysFromNow && new Date(p.expiryDate) >= new Date()
      );

      if (lowStockProducts.length > 0 || expiringProducts.length > 0) {
        const ownerPhone = shop.users[0]?.phone;
        if (ownerPhone && process.env.WHATSAPP_TOKEN) {
          let message = `*Smart Dukaan Alert for ${shop.name}*\n\n`;
          if (lowStockProducts.length > 0) {
            message += `*Low Stock Products (${lowStockProducts.length}):*\n`;
            lowStockProducts.slice(0, 5).forEach((p) => {
              message += `- ${p.name}: ${p.quantity} left (min: ${p.lowStockAt})\n`;
            });
          }
          if (expiringProducts.length > 0) {
            message += `\n*Expiring Soon (${expiringProducts.length}):*\n`;
            expiringProducts.slice(0, 5).forEach((p) => {
              const expDate = new Date(p.expiryDate).toLocaleDateString('en-IN');
              message += `- ${p.name}: expires ${expDate}\n`;
            });
          }
          await sendWhatsAppMessage(ownerPhone, message);
        }
        console.log(`[Alert] Shop: ${shop.name} | Low Stock: ${lowStockProducts.length} | Expiring: ${expiringProducts.length}`);
      }
    }
  } catch (error) {
    console.error('Alert job error:', error);
  }
};

const sendWhatsAppMessage = async (phone, message) => {
  if (!process.env.WHATSAPP_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) return;
  try {
    const axios = require('axios');
    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: `91${phone}`,
        type: 'text',
        text: { body: message },
      },
      { headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('WhatsApp send error:', error.message);
  }
};

const startAlertJobs = () => {
  // Daily 8:00 AM — Low stock & expiry check
  cron.schedule('0 8 * * *', () => {
    console.log('[CRON] Running daily stock & expiry check...');
    checkLowStockAndExpiry();
  });

  console.log('[JOBS] Alert jobs scheduled (daily at 8:00 AM)');
};

module.exports = { startAlertJobs, sendWhatsAppMessage };
