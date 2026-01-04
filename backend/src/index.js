const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['https://zapsters-attendance.vercel.app', 'http://localhost:3000', 'https://intern.zapsters.in'],
  credentials: true
}));
app.use(express.json());

// Routes
const adminRoutes = require('./routes/adminRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/admin', adminRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Zapsters Attendance API is running');
});

// Seed Domains
const seedDomains = require('./utils/seedDomains');
seedDomains();

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
