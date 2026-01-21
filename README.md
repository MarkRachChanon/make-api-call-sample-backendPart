# Member API - เอกสารสร้าง Backend API ด้วย Express + Prisma + MySQL

## 📋 สารบัญ
1. [โครงสร้างโปรเจค](#โครงสร้างโปรเจค)
2. [ขั้นตอนการสร้างโปรเจค](#ขั้นตอนการสร้างโปรเจค)
3. [ไฟล์ทั้งหมดในโปรเจค](#ไฟล์ทั้งหมดในโปรเจค)
4. [คำสั่งรันโปรเจค](#คำสั่งรันโปรเจค)
5. [ทดสอบ API](#ทดสอบ-api)

---

## โครงสร้างโปรเจค

```
member-api/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── controllers/
│   │   └── member.controller.js
│   ├── routes/
│   │   └── member.routes.js
│   └── index.js
├── .env
├── .gitignore
├── docker-compose.yml
└── package.json
```

---

## ขั้นตอนการสร้างโปรเจค

### 1. สร้างโปรเจคและโครงสร้างโฟลเดอร์

```bash
mkdir member-api
cd member-api
npm init -y

# สร้างโฟลเดอร์
mkdir prisma
mkdir src
mkdir src/controllers
mkdir src/routes
```

---

### 2. ติดตั้ง Dependencies

```bash
npm install express dotenv mysql2
npm install prisma@5.21.1 @prisma/client@5.21.1 --save-dev
npm install nodemon --save-dev
```

---

### 3. สร้างไฟล์ Configuration

#### 3.1 ไฟล์ `package.json`

```json
{
  "name": "member-api",
  "version": "1.0.0",
  "description": "Member Management API",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@prisma/client": "^5.21.1",
    "dotenv": "^16.4.5",
    "express": "^4.18.2",
    "mysql2": "^3.9.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "prisma": "^5.21.1"
  }
}
```

---

#### 3.2 ไฟล์ `docker-compose.yml`

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: member_mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: member_db
      MYSQL_USER: apiuser
      MYSQL_PASSWORD: apipassword
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    command: --default-authentication-plugin=mysql_native_password

volumes:
  mysql_data:
```

---

#### 3.3 ไฟล์ `.env`

```env
DATABASE_URL="mysql://root:rootpassword@localhost:3306/member_db"
PORT=4000
```

---

#### 3.4 ไฟล์ `.gitignore`

```
node_modules/
.env
*.log
.DS_Store
prisma/migrations/
```

---

## ไฟล์ทั้งหมดในโปรเจค

### 1. `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

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
```

**อธิบาย Schema:**
- `@id @default(autoincrement())` - Primary Key ที่เพิ่มค่าอัตโนมัติ
- `String?` - ฟิลด์ที่สามารถเป็น null ได้
- `@map("first_name")` - แมปชื่อคอลัมน์ในฐานข้อมูล
- `@default(now())` - ค่าดีฟอลต์เป็นเวลาปัจจุบัน
- `@updatedAt` - อัปเดตอัตโนมัติทุกครั้งที่มีการแก้ไข
- `@@map("members")` - ชื่อตารางในฐานข้อมูล

---

### 2. `src/controllers/member.controller.js`

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /members - ดึงสมาชิกทั้งหมด
exports.getMembers = async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      status: 'success',
      message: 'ดึงข้อมูลสมาชิกสำเร็จ',
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

### 3. `src/routes/member.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const controller = require('../controllers/member.controller');

router.get('/', controller.getMembers);
router.get('/:id', controller.getMemberById);
router.post('/', controller.createMember);
router.put('/:id', controller.updateMember);
router.delete('/:id', controller.deleteMember);

module.exports = router;
```

---

### 4. `src/index.js`

```javascript
require('dotenv').config();
const express = require('express');
const memberRoutes = require('./routes/member.routes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  console.log('='.repeat(50));
});
```

---

## คำสั่งรันโปรเจค

### 1. รัน Docker MySQL

```bash
docker-compose up -d
```

รอ 10-15 วินาที ให้ MySQL เริ่มต้นเสร็จ

---

### 2. รัน Migration

```bash
npx prisma migrate dev --name init
```

คำสั่งนี้จะ:
- สร้างตาราง `members` ในฐานข้อมูล
- สร้างโฟลเดอร์ `prisma/migrations/`
- Generate Prisma Client

---

### 3. รันเซิร์ฟเวอร์

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

เมื่อรันสำเร็จจะเห็น:
```
==================================================
🚀 Server กำลังทำงานที่ http://localhost:4000
📊 Members API: http://localhost:4000/members
==================================================
```

---

## ทดสอบ API

### 1. ทดสอบ Root Endpoint

**Request:**
```
GET http://localhost:4000/
```

**Response:**
```json
{
  "message": "🚀 Member Management API",
  "version": "1.0.0",
  "endpoints": {
    "members": "http://localhost:4000/members"
  }
}
```

---

### 2. สร้างสมาชิกใหม่

**Request:**
```
POST http://localhost:4000/members
Content-Type: application/json

{
  "firstName": "สมชาย",
  "lastName": "ใจดี",
  "email": "somchai@example.com",
  "phone": "0812345678",
  "address": "123 ถนนสุขุมวิท กรุงเทพฯ"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "message": "สร้างสมาชิกสำเร็จ",
  "data": {
    "id": 1,
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "email": "somchai@example.com",
    "phone": "0812345678",
    "address": "123 ถนนสุขุมวิท กรุงเทพฯ",
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:30:00.000Z"
  }
}
```

---

### 3. ดึงสมาชิกทั้งหมด

**Request:**
```
GET http://localhost:4000/members
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "ดึงข้อมูลสมาชิกสำเร็จ",
  "data": [
    {
      "id": 1,
      "firstName": "สมชาย",
      "lastName": "ใจดี",
      "email": "somchai@example.com",
      "phone": "0812345678",
      "address": "123 ถนนสุขุมวิท กรุงเทพฯ",
      "createdAt": "2025-01-14T10:30:00.000Z",
      "updatedAt": "2025-01-14T10:30:00.000Z"
    }
  ]
}
```

---

### 4. ดึงสมาชิกตาม ID

**Request:**
```
GET http://localhost:4000/members/1
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "ดึงข้อมูลสมาชิกสำเร็จ",
  "data": {
    "id": 1,
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "email": "somchai@example.com",
    "phone": "0812345678",
    "address": "123 ถนนสุขุมวิท กรุงเทพฯ",
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:30:00.000Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "status": "error",
  "message": "ไม่พบสมาชิก"
}
```

---

### 5. แก้ไขสมาชิก

**Request:**
```
PUT http://localhost:4000/members/1
Content-Type: application/json

{
  "firstName": "สมชาย",
  "lastName": "รักดี",
  "email": "somchai.updated@example.com",
  "phone": "0898765432",
  "address": "456 ถนนพระราม 4 กรุงเทพฯ"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "แก้ไขสมาชิกสำเร็จ",
  "data": {
    "id": 1,
    "firstName": "สมชาย",
    "lastName": "รักดี",
    "email": "somchai.updated@example.com",
    "phone": "0898765432",
    "address": "456 ถนนพระราม 4 กรุงเทพฯ",
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:35:00.000Z"
  }
}
```

---

### 6. ลบสมาชิก

**Request:**
```
DELETE http://localhost:4000/members/1
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "ลบสมาชิกสำเร็จ",
  "data": {
    "id": 1,
    "firstName": "สมชาย",
    "lastName": "รักดี",
    "email": "somchai.updated@example.com",
    "phone": "0898765432",
    "address": "456 ถนนพระราม 4 กรุงเทพฯ",
    "createdAt": "2025-01-14T10:30:00.000Z",
    "updatedAt": "2025-01-14T10:35:00.000Z"
  }
}
```

---

## สรุป API Endpoints

| Method | Endpoint | คำอธิบาย | Status Code |
|--------|----------|----------|-------------|
| GET | `/members` | ดึงสมาชิกทั้งหมด | 200 |
| GET | `/members/:id` | ดึงสมาชิกตาม ID | 200, 404 |
| POST | `/members` | สร้างสมาชิกใหม่ | 201, 400 |
| PUT | `/members/:id` | แก้ไขสมาชิก | 200, 400, 404 |
| DELETE | `/members/:id` | ลบสมาชิก | 200, 404 |

---

## คำสั่ง Prisma ที่เป็นประโยชน์

```bash
# ดู Schema ปัจจุบัน
npx prisma studio

# Generate Client ใหม่
npx prisma generate

# Reset Database
npx prisma migrate reset

# ดูข้อมูลใน Database
npx prisma studio
```

---

## Troubleshooting

### Problem: Cannot connect to database

**Solution:**
```bash
# ตรวจสอบว่า Docker รันอยู่
docker ps

# Restart Docker
docker-compose down
docker-compose up -d
```

---

### Problem: Migration failed

**Solution:**
```bash
# ใช้ root user แทน
# แก้ไข .env
DATABASE_URL="mysql://root:rootpassword@localhost:3306/member_db"

# ลองรัน migration ใหม่
npx prisma migrate dev --name init
```

---

## เสร็จสิ้น! 🎉

ตอนนี้คุณมี Backend API ที่พร้อมใช้งานแล้ว สามารถทดสอบด้วย:
- **Thunder Client** (VSCode Extension)
- **Postman**
- **curl** หรือ **Insomnia**