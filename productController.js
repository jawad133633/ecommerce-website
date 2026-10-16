
const Product = require('../models/Product');
const Store = require('../models/Store');

const getProducts = async (req, res) => {
  try {
    const filter = { stock: { $gt: 0 } };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      const safeSearch = req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [{ name: { $regex: safeSearch, $options: 'i' } }, { category: { $regex: safeSearch, $options: 'i' } }];
    }
    const sort = req.query.sort === 'price-low' ? { price: 1 } : req.query.sort === 'price-high' ? { price: -1 } : { createdAt: -1 };
    const products = await Product.find(filter).populate('store', 'name slug').sort(sort).limit(60);
    return res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    console.error('Get marketplace products error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to fetch products' });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('store', 'name slug description logoUrl');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    const related = await Product.find({ store: product.store._id, _id: { $ne: product._id }, stock: { $gt: 0 } }).limit(4).select('name price imageUrl category store');
    return res.status(200).json({ success: true, product, related });
  } catch (error) {
    if (error.name === 'CastError') return res.status(400).json({ success: false, message: 'Invalid product ID' });
    console.error('Get product details error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to fetch this product' });
  }
};

// Add a product to the logged-in seller's store
const createProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, stock } = req.body;

    if (!name || !category || price === undefined || price === '') {
      return res.status(400).json({
        success: false,
        message: 'Product name, category and price are required',
      });
    }

    const parsedPrice = Number(price);
    const parsedStock = stock === undefined || stock === '' ? 0 : Number(stock);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid non-negative number',
      });
    }

    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a non-negative whole number',
      });
    }

    const store = await Store.findOne({ owner: req.user.id });

    if (!store) {
      return res.status(403).json({
        success: false,
        message: 'Create your store before adding products',
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description || '',
      price: parsedPrice,
      imageUrl: imageUrl || '',
      category: category.trim(),
      stock: parsedStock,
      store: store._id,
      owner: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product,
    });
  } catch (error) {
    console.error('Create product error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding product',
    });
  }
};

// Get only the logged-in seller's products
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ owner: req.user.id })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Get products error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
    });
  }
};

// Delete only a product owned by the logged-in seller
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or you do not own this product',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    console.error('Delete product error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting product',
    });
  }
};

module.exports = {
  getProductById,
  getProducts,
  createProduct,
  getMyProducts,
  deleteProduct,
};

