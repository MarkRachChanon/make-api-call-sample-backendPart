const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
}

// GET /orders - ดึงคำสั่งซื้อทั้งหมด
exports.getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { orderDate: 'desc' }
    });

    res.json({
      status: 'success',
      message: 'ดึงข้อมูลคำสั่งซื้อสำเร็จ',
      total: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: { detail: 'ไม่สามารถดึงข้อมูลคำสั่งซื้อได้' }
    });
  }
};

// GET /orders/:id - ดึงคำสั่งซื้อตาม ID
exports.getOrderById = async (req, res) => {
  const orderId = parseInt(req.params.id, 10);

  if (isNaN(orderId)) {
    return res.status(400).json({
      status: 'error',
      message: 'ID ไม่ถูกต้อง'
    });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'ไม่พบคำสั่งซื้อ'
      });
    }

    res.json({
      status: 'success',
      message: 'ดึงข้อมูลคำสั่งซื้อสำเร็จ',
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: { detail: 'ไม่สามารถดึงข้อมูลคำสั่งซื้อได้' }
    });
  }
};

// POST /orders - สร้างคำสั่งซื้อใหม่
exports.createOrder = async (req, res) => {
  const { customerName, email, phone, totalAmount } = req.body;

  if (!customerName || !email || totalAmount === undefined) {
    return res.status(400).json({
      status: 'error',
      message: 'ข้อมูลไม่ครบถ้วน',
      error: {
        detail: 'customerName, email และ totalAmount เป็นข้อมูลที่จำเป็น'
      }
    });
  }

  try {
    const orderNumber = generateOrderNumber();

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        email,
        phone: phone || null,
        totalAmount: parseFloat(totalAmount),
        status: 'pending'
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'สร้างคำสั่งซื้อสำเร็จ',
      data: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: { detail: 'ไม่สามารถสร้างคำสั่งซื้อได้' }
    });
  }
};

// PUT /orders/:id - แก้ไขคำสั่งซื้อ
exports.updateOrder = async (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const { customerName, email, phone, totalAmount, status } = req.body;

  if (isNaN(orderId)) {
    return res.status(400).json({
      status: 'error',
      message: 'ID ไม่ถูกต้อง'
    });
  }

  if (!customerName || !email || totalAmount === undefined) {
    return res.status(400).json({
      status: 'error',
      message: 'ข้อมูลไม่ครบถ้วน',
      error: {
        detail: 'customerName, email และ totalAmount เป็นข้อมูลที่จำเป็น'
      }
    });
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        customerName,
        email,
        phone: phone ?? null,
        totalAmount: parseFloat(totalAmount),
        status: status || undefined
      }
    });

    res.json({
      status: 'success',
      message: 'แก้ไขคำสั่งซื้อสำเร็จ',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'ไม่พบคำสั่งซื้อ'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: { detail: 'ไม่สามารถแก้ไขคำสั่งซื้อได้' }
    });
  }
};

// DELETE /orders/:id - ลบคำสั่งซื้อ
exports.deleteOrder = async (req, res) => {
  const orderId = parseInt(req.params.id, 10);

  if (isNaN(orderId)) {
    return res.status(400).json({
      status: 'error',
      message: 'ID ไม่ถูกต้อง'
    });
  }

  try {
    const deletedOrder = await prisma.order.delete({
      where: { id: orderId }
    });

    res.json({
      status: 'success',
      message: 'ลบคำสั่งซื้อสำเร็จ',
      data: deletedOrder
    });
  } catch (error) {
    console.error('Error deleting order:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'ไม่พบคำสั่งซื้อ'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: { detail: 'ไม่สามารถลบคำสั่งซื้อได้' }
    });
  }
};

// GET /orders/q/projection - Projection
exports.qProjection = async (req, res) => {
  try {
    const select = {
      id: true,
      orderNumber: true,
      customerName: true,
      totalAmount: true,
      status: true,
    };

    const orders = await prisma.order.findMany({ select });

    res.json({
      status: 'success',
      concept: 'projection (select)',
      description: 'เลือกเฉพาะคอลัมน์ที่ต้องการส่งกลับ',
      select,
      data: orders,
    });
  } catch (error) {
    console.error('Error in qProjection:', error);
    res.status(500).json({
      status: 'error',
      message: 'Projection query failed',
    });
  }
};

// GET /orders/q/status - Status Filter
exports.qStatus = async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({ where });

    res.json({
      status: 'success',
      concept: 'where + exact match',
      description: 'กรองตามสถานะที่ระบุ (pending, completed, cancelled)',
      where,
      data: orders,
    });
  } catch (error) {
    console.error('Error in qStatus:', error);
    res.status(500).json({
      status: 'error',
      message: 'Status filter query failed',
    });
  }
};

// GET /orders/q/amount-range - Amount Range
exports.qAmountRange = async (req, res) => {
  try {
    const min = req.query.min ? parseFloat(req.query.min) : undefined;
    const max = req.query.max ? parseFloat(req.query.max) : undefined;

    const where = {
      totalAmount: {
        ...(min !== undefined ? { gte: min } : {}),
        ...(max !== undefined ? { lte: max } : {}),
      },
    };

    const orders = await prisma.order.findMany({ where });

    res.json({
      status: 'success',
      concept: 'where + number operators (gte, lte)',
      description: 'กรองช่วงยอดเงิน (gte = มากกว่าเท่ากับ, lte = น้อยกว่าเท่ากับ)',
      where,
      data: orders,
    });
  } catch (error) {
    console.error('Error in qAmountRange:', error);
    res.status(500).json({
      status: 'error',
      message: 'Amount range query failed',
    });
  }
};

// GET /orders/q/date-range - Date Range
exports.qDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};

    if (startDate || endDate) {
      where.orderDate = {};

      if (startDate) {
        where.orderDate.gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        where.orderDate.lt = end;
      }
    }

    const orders = await prisma.order.findMany({ where });

    res.json({
      status: 'success',
      concept: 'where + date operators (gte, lt)',
      description: 'กรองช่วงวันที่ (gte = หลังจาก, lt = ก่อน, +1 วันเพื่อรวมวันสุดท้าย)',
      where,
      data: orders,
    });
  } catch (error) {
    console.error('Error in qDateRange:', error);
    res.status(500).json({
      status: 'error',
      message: 'Date range query failed',
    });
  }
};

// GET /orders/q/sort - Sorting
exports.qSort = async (req, res) => {
  try {
    const by = req.query.by || 'id';
    const dir = req.query.dir === 'desc' ? 'desc' : 'asc';

    const allowedFields = ['id', 'orderNumber', 'customerName', 'totalAmount', 'orderDate', 'createdAt'];
    const sortField = allowedFields.includes(by) ? by : 'id';

    const orderBy = { [sortField]: dir };

    const orders = await prisma.order.findMany({ orderBy });

    res.json({
      status: 'success',
      concept: 'orderBy (sorting)',
      description: 'เรียงลำดับข้อมูล (asc = น้อย→มาก, desc = มาก→น้อย)',
      orderBy,
      data: orders,
    });
  } catch (error) {
    console.error('Error in qSort:', error);
    res.status(500).json({
      status: 'error',
      message: 'Sort query failed',
    });
  }
};

// GET /orders/search - Real-world Search
exports.searchOrders = async (req, res) => {
  try {
    const { keyword, status, minAmount, maxAmount, startDate, endDate, sort, order } = req.query;

    const where = {};

    if (keyword) {
      where.OR = [
        { customerName: { contains: keyword, mode: 'insensitive' } },
        { orderNumber: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (minAmount || maxAmount) {
      where.totalAmount = {};
      if (minAmount) {
        where.totalAmount.gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        where.totalAmount.lte = parseFloat(maxAmount);
      }
    }

    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) {
        where.orderDate.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        where.orderDate.lt = end;
      }
    }

    const allowedSortFields = ['orderNumber', 'customerName', 'totalAmount', 'orderDate'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'orderDate';
    const sortOrder = order === 'desc' ? 'desc' : 'asc';

    const orderBy = { [sortField]: sortOrder };

    const orders = await prisma.order.findMany({
      where,
      orderBy,
    });

    res.json({
      status: 'success',
      message: 'ค้นหาคำสั่งซื้อสำเร็จ',
      total: orders.length,
      filters: { keyword, status, minAmount, maxAmount, startDate, endDate },
      sorting: { sort: sortField, order: sortOrder },
      data: orders,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดในการค้นหา',
    });
  }
};