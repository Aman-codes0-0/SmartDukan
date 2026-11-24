const express = require('express');
const router = express.Router();
const { getCustomers, getCustomer, createCustomer, updateCustomer, recordPayment, getPayments } = require('../controllers/customerController');
const auth = require('../middleware/auth');
const { validate, customerSchema, paymentSchema } = require('../middleware/validate');

router.use(auth);

router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.post('/', validate(customerSchema), createCustomer);
router.put('/:id', validate(customerSchema), updateCustomer);
router.post('/:id/payments', validate(paymentSchema), recordPayment);
router.get('/:id/payments', getPayments);

module.exports = router;
