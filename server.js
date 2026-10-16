
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const storeRoutes = require('./routes/storeRoutes');

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/api/auth', authRoutes);
app.use('/api/stores', storeRoutes);

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);


app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MarketHub backend is running!'
  });
});

const startServer = async () => {
  await connectDB();


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
};
startServer();

