# เพิ่ม Resources และ Filter ใน Backend API

## 📋 ภาพรวม

เอกสารนี้สรุปการเพิ่ม 2 Resources ใหม่ (Products, Orders) และเพิ่มความสามารถ Filter ให้ทั้ง 3 Resources

---

## Resources ทั้งหมดในระบบ

| # | Resource | คำอธิบาย | Endpoints |
|---|----------|----------|-----------|
| 1 | **Members** | ข้อมูลสมาชิก | 5 endpoints |
| 2 | **Products** | ข้อมูลสินค้า | 5 endpoints |
| 3 | **Orders** | คำสั่งซื้อ | 5 endpoints |

**รวม: 15 Endpoints**

---

## ขั้นตอนที่ 1: แก้ไข Prisma Schema

แก้ไขไฟล์ `prisma/schema.prisma` เพิ่ม 2 Models ใหม่:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// Model เดิม
model Member {
  id        Int      @id @default(autoincrement())
  firstName String   @map("first_name")
  lastName  String   @map("last_name")
  email     String   @unique
  phone     String?
  address   String?  @db.Text
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("members")
}

// Model ใหม่ที่ 1: Products
model Product {
  id          Int      @id @default(autoincrement())
  name        String
  description String?  @db.Text
  price       Float
  stock       Int      @default(0)
  category    String?
  imageUrl    String?  @map("image_url")
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("products")
}

// Model ใหม่ที่ 2: Orders
model Order {
  id          Int      @id @default(autoincrement())
  orderNumber String   @unique @map("order_number")
  customerName String  @map("customer_name")
  email       String
  phone       String?
  totalAmount Float    @map("total_amount")
  status      String   @default("pending")
  orderDate   DateTime @default(now()) @map("order_date")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@map("orders")
}
```

---

## ขั้นตอนที่ 2: รัน Migration

```bash
npx prisma migrate dev --name add_products_orders
```

คำสั่งนี้จะ:
- สร้างตาราง `products` และ `orders` ในฐานข้อมูล
- Generate Prisma Client ใหม่

---

## ขั้นตอนที่ 3: สร้าง/แก้ไข Controllers

### 3.1 แก้ไขไฟล์ `src/controllers/member.controller.js` (เพิ่ม Filter)

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /members - ดึงสมาชิกทั้งหมด (พร้อม Filter)
exports.getMembers = async (req, res) => {
  try {
    const { search, email, phone } = req.query;

    // สร้าง where condition
    const where = {};

    // Filter: ค้นหาจาก firstName หรือ lastName
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } }
      ];
    }

    // Filter: ค้นหาจาก email (exact match)
    if (email) {
      where.email = { contains: email };
    }

    // Filter: ค้นหาจาก phone (partial match)
    if (phone) {
      where.phone = { contains: phone };
    }

    const members = await prisma.member.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      status: 'success',
      message: 'ดึงข้อมูลสมาชิกสำเร็จ',
      total: members.length,
      filters: { search, email, phone },
      data: members
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: { detail: 'ไม่สามารถดึงข้อมูลสมาชิกได้' }
    });
  }
};

// GET /members/:id - ดึงสมาชิกตาม ID
exports.getMemberById = async (req, res) => {
  const memberId = parseInt(req.params.id, 10);

  if (isNaN(memberId)) {
    return res.status(400).json({
      status: 'error',
      message: 'ID ไม่ถูกต้อง'
    });
  }

  try {
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      return res.status(404).json({
        status: 'error',
        message: 'ไม่พบสมาชิก'
      });
    }

    res.json({
      status: 'success',
      message: 'ดึงข้อมูลสมาชิกสำเร็จ',
      data: member
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: { detail: 'ไม่สามารถดึงข้อมูลสมาชิกได้' }
    });
  }
};

// POST /members - สร้างสมาชิกใหม่
exports.createMember = async (req, res) => {
  const { firstName, lastName, email, phone, address } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({
      status: 'error',
      message: 'ข้อมูลไม่ครบถ้วน',
      error: {
        detail: 'firstName, lastName และ email เป็นข้อมูลที่จำเป็น'
      }
    });
  }

  try {
    // ตรวจสอบ email ซ้ำ
    const existingMember = await prisma.member.findUnique({
      where: { email }
    });

    if (existingMember) {
      return res.status(400).json({
        status: 'error',
        message: 'อีเมลนี้ถูกใช้งานแล้ว'
      });
    }

    const newMember = await prisma.member.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        address: address || null
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'สร้างสมาชิกสำเร็จ',
      data: newMember
    });
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: { detail: 'ไม่สามารถสร้างสมาชิกได้' }
    });
  }
};

// PUT /members/:id - แก้ไขสมาชิก
exports.updateMember = async (req, res) => {
  const memberId = parseInt(req.params.id, 10);
  const { firstName, lastName, email, phone, address } = req.body;

  if (isNaN(memberId)) {
    return res.status(400).json({
      status: 'error',
      message: 'ID ไม่ถูกต้อง'
    });
  }

  if (!firstName || !lastName || !email) {
    return res.status(400).json({
      status: 'error',
      message: 'ข้อมูลไม่ครบถ้วน',
      error: {
        detail: 'firstName, lastName และ email เป็นข้อมูลที่จำเป็น'
      }
    });
  }

  try {
    const existingMember = await prisma.member.findUnique({
      where: { email }
    });

    if (existingMember && existingMember.id !== memberId) {
      return res.status(400).json({
        status: 'error',
        message: 'อีเมลนี้ถูกใช้งานโดยสมาชิกอื่นแล้ว'
      });
    }

    const updatedMember = await prisma.member.update({
      where: { id: memberId },
      data: {
        firstName,
        lastName,
        email,
        phone: phone ?? null,
        address: address ?? null
      }
    });

    res.json({
      status: 'success',
      message: 'แก้ไขสมาชิกสำเร็จ',
      data: updatedMember
    });
  } catch (error) {
    console.error('Error updating member:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'ไม่พบสมาชิก'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: { detail: 'ไม่สามารถแก้ไขสมาชิกได้' }
    });
  }
};

// DELETE /members/:id - ลบสมาชิก
exports.deleteMember = async (req, res) => {
  const memberId = parseInt(req.params.id, 10);

  if (isNaN(memberId)) {
    return res.status(400).json({
      status: 'error',
      message: 'ID ไม่ถูกต้อง'
    });
  }

  try {
    const deletedMember = await prisma.member.delete({
      where: { id: memberId }
    });

    res.json({
      status: 'success',
      message: 'ลบสมาชิกสำเร็จ',
      data: deletedMember
    });
  } catch (error) {
    console.error('Error deleting member:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'ไม่พบสมาชิก'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: { detail: 'ไม่สามารถลบสมาชิกได้' }
    });
  }
};
```

---

### 3.2 สร้างไฟล์ `src/controllers/product.controller.js` (ใหม่)

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /products - ดึงสินค้าทั้งหมด (พร้อม Filter)
exports.getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, inStock } = req.query;

    // สร้าง where condition
    const where = {};

    // Filter: ค้นหาจากชื่อสินค้า
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    // Filter: หมวดหมู่
    if (category) {
      where.category = { contains: category };
    }

    // Filter: ช่วงราคา
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    // Filter: มีสินค้าในสต็อก
    if (inStock === 'true') {
      where.stock = { gt: 0 };
    }

    // Filter: เฉพาะสินค้าที่เปิดขาย
    where.isActive = true;

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      status: 'success',
      message: 'ดึงข้อมูลสินค้าสำเร็จ',
      total: products.length,
      filters: { search, category, minPrice, maxPrice, inStock },
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: { detail: 'ไม่สามารถดึงข้อมูลสินค้าได้' }
    });
  }
};

// GET /products/:id - ดึงสินค้าตาม ID
exports.getProductById = async (req, res) => {
  const productId = parseInt(req.params.id, 10);

  if (isNaN(productId)) {
    return res.status(400).json({
      status: 'error',
      message: 'ID ไม่ถูกต้อง'
    });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'ไม่พบสินค้า'
      });
    }

    res.json({
      status: 'success',
      message: 'ดึงข้อมูลสินค้าสำเร็จ',
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: { detail: 'ไม่สามารถดึงข้อมูลสินค้าได้' }
    });
  }
};

// POST /products - สร้างสินค้าใหม่
exports.createProduct = async (req, res) => {
  const { name, description, price, stock, category, imageUrl } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({
      status: 'error',
      message: 'ข้อมูลไม่ครบถ้วน',
      error: {
        detail: 'name และ price เป็นข้อมูลที่จำเป็น'
      }
    });
  }

  try {
    const newProduct = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        stock: stock || 0,
        category: category || null,
        imageUrl: imageUrl || null
      }
    });

    res.status(201).json({
      status: 'success',
      message: 'สร้างสินค้าสำเร็จ',
      data: newProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: { detail: 'ไม่สามารถสร้างสินค้าได้' }
    });
  }
};

// PUT /products/:id - แก้ไขสินค้า
exports.updateProduct = async (req, res) => {
  const productId = parseInt(req.params.id, 10);
  const { name, description, price, stock, category, imageUrl, isActive } = req.body;

  if (isNaN(productId)) {
    return res.status(400).json({
      status: 'error',
      message: 'ID ไม่ถูกต้อง'
    });
  }

  if (!name || price === undefined) {
    return res.status(400).json({
      status: 'error',
      message: 'ข้อมูลไม่ครบถ้วน',
      error: {
        detail: 'name และ price เป็นข้อมูลที่จำเป็น'
      }
    });
  }

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description: description ?? null,
        price: parseFloat(price),
        stock: stock ?? undefined,
        category: category ?? null,
        imageUrl: imageUrl ?? null,
        isActive: typeof isActive === 'boolean' ? isActive : undefined
      }
    });

    res.json({
      status: 'success',
      message: 'แก้ไขสินค้าสำเร็จ',
      data: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'ไม่พบสินค้า'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: { detail: 'ไม่สามารถแก้ไขสินค้าได้' }
    });
  }
};

// DELETE /products/:id - ลบสินค้า
exports.deleteProduct = async (req, res) => {
  const productId = parseInt(req.params.id, 10);

  if (isNaN(productId)) {
    return res.status(400).json({
      status: 'error',
      message: 'ID ไม่ถูกต้อง'
    });
  }

  try {
    const deletedProduct = await prisma.product.delete({
      where: { id: productId }
    });

    res.json({
      status: 'success',
      message: 'ลบสินค้าสำเร็จ',
      data: deletedProduct
    });
  } catch (error) {
    console.error('Error deleting product:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'ไม่พบสินค้า'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์',
      error: { detail: 'ไม่สามารถลบสินค้าได้' }
    });
  }
};
```

---

### 3.3 สร้างไฟล์ `src/controllers/order.controller.js` (ใหม่)

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// สร้างเลขที่คำสั่งซื้ออัตโนมัติ
function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
}

// GET /orders - ดึงคำสั่งซื้อทั้งหมด (พร้อม Filter)
exports.getOrders = async (req, res) => {
  try {
    const { status, customerName, startDate, endDate, minAmount, maxAmount } = req.query;

    // สร้าง where condition
    const where = {};

    // Filter: สถานะคำสั่งซื้อ
    if (status) {
      where.status = status;
    }

    // Filter: ชื่อลูกค้า
    if (customerName) {
      where.customerName = { contains: customerName };
    }

    // Filter: ช่วงวันที่
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) {
        where.orderDate.gte = new Date(startDate);
      }
      if (endDate) {
        // เพิ่ม 1 วันเพื่อให้ครอบคลุมทั้งวัน
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        where.orderDate.lt = end;
      }
    }

    // Filter: ช่วงยอดเงิน
    if (minAmount || maxAmount) {
      where.totalAmount = {};
      if (minAmount) {
        where.totalAmount.gte = parseFloat(minAmount);
      }
      if (maxAmount) {
        where.totalAmount.lte = parseFloat(maxAmount);
      }
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { orderDate: 'desc' }
    });

    res.json({
      status: 'success',
      message: 'ดึงข้อมูลคำสั่งซื้อสำเร็จ',
      total: orders.length,
      filters: { status, customerName, startDate, endDate, minAmount, maxAmount },
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
```

---

## ขั้นตอนที่ 4: สร้าง Routes

### 4.1 สร้างไฟล์ `src/routes/product.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const controller = require('../controllers/product.controller');

router.get('/', controller.getProducts);
router.get('/:id', controller.getProductById);
router.post('/', controller.createProduct);
router.put('/:id', controller.updateProduct);
router.delete('/:id', controller.deleteProduct);

module.exports = router;
```

---

### 4.2 สร้างไฟล์ `src/routes/order.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const controller = require('../controllers/order.controller');

router.get('/', controller.getOrders);
router.get('/:id', controller.getOrderById);
router.post('/', controller.createOrder);
router.put('/:id', controller.updateOrder);
router.delete('/:id', controller.deleteOrder);

module.exports = router;
```

---

## ขั้นตอนที่ 5: แก้ไข src/index.js

เพิ่ม Routes ใหม่และ CORS:

```javascript
require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('../swagger-output.json');
const memberRoutes = require('./routes/member.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (สำหรับ React Frontend)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Routes
app.use('/members', memberRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Member Management API',
    version: '1.0.0',
    endpoints: {
      documentation: `http://localhost:${PORT}/api-docs`,
      members: `http://localhost:${PORT}/members`,
      products: `http://localhost:${PORT}/products`,
      orders: `http://localhost:${PORT}/orders`
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
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`👥 Members API: http://localhost:${PORT}/members`);
  console.log(`📦 Products API: http://localhost:${PORT}/products`);
  console.log(`🛒 Orders API: http://localhost:${PORT}/orders`);
  console.log('='.repeat(50));
});
```

---

## ขั้นตอนที่ 6: รันและทดสอบ

```bash
# Generate Swagger
npm run swagger

# Start Server
npm start
```

---

## สรุป Filter ทั้งหมด

### 1. Members Filters

| Parameter | ตัวอย่าง | คำอธิบาย |
|-----------|----------|----------|
| `search` | `?search=สมชาย` | ค้นหาจาก firstName หรือ lastName |
| `email` | `?email=@example.com` | ค้นหาจาก email |
| `phone` | `?phone=081` | ค้นหาจากเบอร์โทร |

**ตัวอย่างการใช้งาน:**
```
GET /members?search=สมชาย
GET /members?email=gmail
GET /members?search=สม&phone=081
```

---

### 2. Products Filters

| Parameter | ตัวอย่าง | คำอธิบาย |
|-----------|----------|----------|
| `search` | `?search=เสื้อ` | ค้นหาจากชื่อหรือคำอธิบาย |
| `category` | `?category=เสื้อผ้า` | กรองตามหมวดหมู่ |
| `minPrice` | `?minPrice=100` | ราคาต่ำสุด |
| `maxPrice` | `?maxPrice=1000` | ราคาสูงสุด |
| `inStock` | `?inStock=true` | มีสินค้าในสต็อก |

**ตัวอย่างการใช้งาน:**
```
GET /products?search=เสื้อ
GET /products?category=เสื้อผ้า&minPrice=500&maxPrice=2000
GET /products?inStock=true
```

---

### 3. Orders Filters

| Parameter | ตัวอย่าง | คำอธิบาย |
|-----------|----------|----------|
| `status` | `?status=pending` | กรองตามสถานะ |
| `customerName` | `?customerName=สมชาย` | ค้นหาจากชื่อลูกค้า |
| `startDate` | `?startDate=2024-01-01` | วันที่เริ่มต้น |
| `endDate` | `?endDate=2024-12-31` | วันที่สิ้นสุด |
| `minAmount` | `?minAmount=1000` | ยอดเงินต่ำสุด |
| `maxAmount` | `?maxAmount=5000` | ยอดเงินสูงสุด |

**ตัวอย่างการใช้งาน:**
```
GET /orders?status=pending
GET /orders?startDate=2024-01-01&endDate=2024-12-31
GET /orders?status=completed&minAmount=2000
```

---

## Prisma Query Operators ที่ใช้

| Operator | คำอธิบาย | ตัวอย่างการใช้งาน |
|----------|----------|-------------------|
| `contains` | ค้นหาแบบ partial match | `{ name: { contains: "keyword" } }` |
| `gte` | มากกว่าหรือเท่ากับ (Greater Than or Equal) | `{ price: { gte: 100 } }` |
| `lte` | น้อยกว่าหรือเท่ากับ (Less Than or Equal) | `{ price: { lte: 1000 } }` |
| `gt` | มากกว่า (Greater Than) | `{ stock: { gt: 0 } }` |
| `lt` | น้อยกว่า (Less Than) | `{ orderDate: { lt: date } }` |
| `OR` | เงื่อนไข OR | `{ OR: [{ firstName: ... }, { lastName: ... }] }` |
| `AND` | เงื่อนไข AND (default) | `{ category: ..., price: { gte: 100 } }` |

---

## อธิบาย Prisma Error Code P2025

### `error.code === 'P2025'` คืออะไร?

**P2025** คือ Error Code ของ Prisma ที่แจ้งว่า **"Record not found"** (ไม่พบข้อมูล)

### เกิดเมื่อไหร?

เกิดเมื่อพยายาม **update** หรือ **delete** ข้อมูลที่ไม่มีในฐานข้อมูล

### ตัวอย่าง:

```javascript
// ลบข้อมูล ID 999 (แต่ไม่มีในฐานข้อมูล)
await prisma.member.delete({
  where: { id: 999 }
});

// Prisma จะโยน Error Code: P2025
```

### ทำไมต้องเช็ค?

เพื่อส่ง HTTP Status Code ที่ถูกต้องกลับไปให้ Client:

```javascript
try {
  const deletedMember = await prisma.member.delete({
    where: { id: memberId }
  });
  
  res.json({
    status: 'success',
    message: 'ลบสำเร็จ',
    data: deletedMember
  });
} catch (error) {
  // เช็ค Error Code
  if (error.code === 'P2025') {
    return res.status(404).json({
      status: 'error',
      message: 'ไม่พบข้อมูล'  // 404 Not Found
    });
  }
  
  // Error อื่น ๆ
  res.status(500).json({
    status: 'error',
    message: 'เกิดข้อผิดพลาด'  // 500 Internal Server Error
  });
}
```

---

## API Endpoints Summary

### Members (5 endpoints)
- `GET /members` - ดึงทั้งหมด (พร้อม filter)
- `GET /members/:id` - ดึงตาม ID
- `POST /members` - สร้างใหม่
- `PUT /members/:id` - แก้ไข
- `DELETE /members/:id` - ลบ

### Products (5 endpoints)
- `GET /products` - ดึงทั้งหมด (พร้อม filter)
- `GET /products/:id` - ดึงตาม ID
- `POST /products` - สร้างใหม่
- `PUT /products/:id` - แก้ไข
- `DELETE /products/:id` - ลบ

### Orders (5 endpoints)
- `GET /orders` - ดึงทั้งหมด (พร้อม filter)
- `GET /orders/:id` - ดึงตาม ID
- `POST /orders` - สร้างใหม่
- `PUT /orders/:id` - แก้ไข
- `DELETE /orders/:id` - ลบ

**รวม: 15 Endpoints**

---

## โครงสร้างโปรเจคสุดท้าย

```
member-api/
├── prisma/
│   ├── schema.prisma           (3 Models: Member, Product, Order)
│   └── migrations/
├── src/
│   ├── controllers/
│   │   ├── member.controller.js   (พร้อม filter)
│   │   ├── product.controller.js  (ใหม่ + filter)
│   │   └── order.controller.js    (ใหม่ + filter)
│   ├── routes/
│   │   ├── member.routes.js
│   │   ├── product.routes.js      (ใหม่)
│   │   └── order.routes.js        (ใหม่)
│   └── index.js                   (เพิ่ม CORS + routes ใหม่)
├── .env
├── docker-compose.yml
├── nodemon.json
├── package.json
├── swagger.js
└── swagger-output.json            (Auto generate)
```

---

## ตัวอย่างการทดสอบ

### 1. ทดสอบ Products

```bash
# สร้างสินค้า
curl -X POST http://localhost:4000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "เสื้อยืด",
    "description": "เสื้อยืดคอกลม สีขาว",
    "price": 299,
    "stock": 50,
    "category": "เสื้อผ้า"
  }'

# ค้นหาสินค้า
curl "http://localhost:4000/products?search=เสื้อ&minPrice=200&maxPrice=500"

# ดูสินค้าที่มีในสต็อก
curl "http://localhost:4000/products?inStock=true"
```

---

### 2. ทดสอบ Orders

```bash
# สร้างคำสั่งซื้อ
curl -X POST http://localhost:4000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "สมชาย ใจดี",
    "email": "somchai@example.com",
    "phone": "0812345678",
    "totalAmount": 1500
  }'

# กรองตามสถานะ
curl "http://localhost:4000/orders?status=pending"

# กรองตามวันที่และยอดเงิน
curl "http://localhost:4000/orders?startDate=2024-01-01&minAmount=1000"
```

---

## เสร็จสิ้น! ✅

Backend API พร้อมแล้วสำหรับ:
- ✅ **3 Resources** (Members, Products, Orders)
- ✅ **15 Endpoints** (CRUD ครบทุก resource)
- ✅ **Filter ทุก Resource** (พร้อม Prisma Query)
- ✅ **CORS เปิดแล้ว** (พร้อมต่อ React Frontend)
- ✅ **Swagger Documentation** (Auto generate)
- ✅ **Error Handling** (รวม P2025 check)

---