
const express = require('express');

const protect = require('../middleware/authMiddleware');

const {
  createStore,
  getStores,
  getMyStore,
  getStoreBySlug,
} = require('../controllers/storeController');

const router = express.Router();

router.post('/', protect, createStore);
router.get('/', getStores);
router.get('/my-store', protect, getMyStore);
router.get('/:slug', getStoreBySlug);

module.exports = router;
