require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('../swagger-output.json');
const memberRoutes = require('./routes/member.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Routes
app.use('/members', memberRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Member Management API',
    version: '1.0.0',
    endpoints: {
      members: `http://localhost:${PORT}/members`
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'ไม่พบเส้นทาง API ที่ร้องขอ'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server กำลังทำงานที่ http://localhost:${PORT}`);
  console.log(`📊 Members API: http://localhost:${PORT}/members`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log('='.repeat(50));
});