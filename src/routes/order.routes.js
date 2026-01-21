const express = require('express');
const router = express.Router();
const controller = require('../controllers/order.controller');

router.get('/q/projection',
  // #swagger.tags = ['Orders - Query Demo']
  // #swagger.description = 'Projection: เลือกคอลัมน์ที่ต้องการส่งกลับ (id, orderNumber, customerName, totalAmount, status)'
  controller.qProjection
);

router.get('/q/status',
  // #swagger.tags = ['Orders - Query Demo']
  // #swagger.description = 'Status Filter: กรองตามสถานะ (status=pending/completed/cancelled)'
  controller.qStatus
);

router.get('/q/amount-range',
  // #swagger.tags = ['Orders - Query Demo']
  // #swagger.description = 'Amount Range: กรองช่วงยอดเงิน (min, max) ด้วย gte, lte'
  controller.qAmountRange
);

router.get('/q/date-range',
  // #swagger.tags = ['Orders - Query Demo']
  // #swagger.description = 'Date Range: กรองช่วงวันที่ (startDate, endDate) ด้วย gte, lt'
  controller.qDateRange
);

router.get('/q/sort',
  // #swagger.tags = ['Orders - Query Demo']
  // #swagger.description = 'Sorting: เรียงลำดับข้อมูล (by=orderNumber/customerName/totalAmount/orderDate, dir=asc/desc)'
  controller.qSort
);

router.get('/search',
  // #swagger.tags = ['Orders']
  // #swagger.description = 'ค้นหาคำสั่งซื้อแบบรวม (keyword, status, minAmount, maxAmount, startDate, endDate, sort, order)'
  controller.searchOrders
);

router.get('/',
  // #swagger.tags = ['Orders']
  // #swagger.description = 'ดึงคำสั่งซื้อทั้งหมด'
  controller.getOrders
);

router.get('/:id',
  // #swagger.tags = ['Orders']
  // #swagger.description = 'ดึงคำสั่งซื้อตาม ID'
  controller.getOrderById
);

router.post('/',
  // #swagger.tags = ['Orders']
  // #swagger.description = 'สร้างคำสั่งซื้อใหม่'
  controller.createOrder
);

router.put('/:id',
  // #swagger.tags = ['Orders']
  // #swagger.description = 'แก้ไขข้อมูลคำสั่งซื้อ'
  controller.updateOrder
);

router.delete('/:id',
  // #swagger.tags = ['Orders']
  // #swagger.description = 'ลบคำสั่งซื้อ'
  controller.deleteOrder
);

module.exports = router;