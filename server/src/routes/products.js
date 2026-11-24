const express = require('express');
const router = express.Router();
const { getProducts, getProduct, getLowStockProducts, getExpiringProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const auth = require('../middleware/auth');
const { validate, productSchema } = require('../middleware/validate');

router.use(auth);

router.get('/low-stock', getLowStockProducts);
router.get('/expiring', getExpiringProducts);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', validate(productSchema), createProduct);
router.put('/:id', validate(productSchema), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
