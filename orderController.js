const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Store = require('../models/Store');

const getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id }).sort({ createdAt: -1 }).populate('items.store', 'name slug');
    return res.json({ success: true, orders });
  } catch (error) {
    console.error('Get buyer orders error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to load your orders.' });
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json({ success: false, message: 'Create a store to manage orders.' });
    const orders = await Order.find({ 'items.store': store._id }).sort({ createdAt: -1 }).populate('buyer', 'name email');
    const sellerOrders = orders.map((order) => ({
      _id: order._id, createdAt: order.createdAt, customerName: order.customerName,
      phone: order.phone, address: order.address, paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      items: order.items.filter((item) => String(item.store) === String(store._id)),
    }));
    return res.json({ success: true, orders: sellerOrders });
  } catch (error) {
    console.error('Get seller orders error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to load store orders.' });
  }
};

const updateSellerOrderItem = async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!['processing', 'shipped', 'delivered'].includes(status)) return res.status(400).json({ success: false, message: 'Choose a valid fulfillment status.' });
    const store = await Store.findOne({ owner: req.user.id });
    if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });
    const result = await Order.updateOne(
      { _id: req.params.orderId, 'items.product': req.params.productId, 'items.store': store._id },
      { $set: { 'items.$[line].fulfillmentStatus': status } },
      { arrayFilters: [{ 'line.product': req.params.productId, 'line.store': store._id }] },
    );
    if (!result.modifiedCount) return res.status(404).json({ success: false, message: 'Order item not found or already has this status.' });
    return res.json({ success: true, message: 'Order status updated.' });
  } catch (error) {
    console.error('Update seller order error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to update this order item.' });
  }
};

const createOrder = async (req, res) => {
  const { items, customerName, phone, address } = req.body || {};
  if (!Array.isArray(items) || items.length === 0 || items.length > 50 || !customerName?.trim() || !phone?.trim() || !address?.trim()) {
    return res.status(400).json({ success: false, message: 'Add items and complete your name, phone, and delivery address.' });
  }
  const requested = new Map();
  for (const item of items) {
    const id = String(item.productId || '');
    if (!mongoose.isValidObjectId(id) || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
      return res.status(400).json({ success: false, message: 'Your bag has an invalid product or quantity. Please check it and try again.' });
    }
    requested.set(id, (requested.get(id) || 0) + Number(item.quantity));
  }
  const reserved = [];
  try {
    const lineItems = [];
    for (const [id, quantity] of requested) {
      const product = await Product.findOneAndUpdate({ _id: id, stock: { $gte: quantity } }, { $inc: { stock: -quantity } }, { new: true });
      if (!product) {
        for (const item of reserved) await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
        return res.status(409).json({ success: false, message: 'Something in your bag just sold out. Refresh the marketplace and try again.' });
      }
      reserved.push({ product: product._id, quantity });
      lineItems.push({ product: product._id, store: product.store, name: product.name, quantity, unitPrice: product.price, imageUrl: product.imageUrl });
    }
    const total = lineItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const order = await Order.create({
      buyer: req.user.id, items: lineItems, total,
      customerName: customerName.trim(), phone: phone.trim(), address: address.trim(),
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'unpaid',
    });
    return res.status(201).json({ success: true, message: 'Your order is placed. Pay cash on delivery.', order: { id: order._id, total: order.total, status: order.status, paymentStatus: order.paymentStatus } });
  } catch (error) {
    for (const item of reserved) await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } }).catch(() => {});
    console.error('Create order error:', error.message);
    return res.status(500).json({ success: false, message: 'We could not place your order. Your stock has been restored; please try again.' });
  }
};

module.exports = { createOrder, getBuyerOrders, getSellerOrders, updateSellerOrderItem };
