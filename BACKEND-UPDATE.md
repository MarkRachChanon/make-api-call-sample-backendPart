# Backend API Documentation

เอกสารสรุป Backend API ที่ใช้ Prisma Query แบบแยกแนวคิดเพื่อการสอน

---

## 📋 ภาพรวม

Backend มี 3 Resources:
- **Members** - ข้อมูลสมาชิก
- **Products** - ข้อมูลสินค้า  
- **Orders** - ข้อมูลคำสั่งซื้อ

แต่ละ Resource มี 11 Endpoints แบ่งเป็น 3 กลุ่ม:
1. **CRUD** (5 endpoints) - Create, Read, Update, Delete
2. **Query Demo** (5 endpoints) - สอนแนวคิด Prisma Query
3. **Search** (1 endpoint) - ค้นหาแบบรวมเงื่อนไข

---

## 📊 Members API

### CRUD Endpoints
```
GET    /members           - ดึงสมาชิกทั้งหมด (เรียง createdAt desc)
GET    /members/:id       - ดึงสมาชิกตาม ID
POST   /members           - สร้างสมาชิกใหม่
PUT    /members/:id       - แก้ไขสมาชิก
DELETE /members/:id       - ลบสมาชิก
```

### Query Demo Endpoints
```
GET /members/q/projection
→ Select เฉพาะ: id, firstName, lastName, email

GET /members/q/name-search?keyword=สม
→ ค้นหาชื่อหรือนามสกุลด้วย contains (OR)

GET /members/q/email-filter?domain=gmail
→ กรองอีเมลด้วย contains

GET /members/q/phone-filter?prefix=081
→ กรองเบอร์โทรด้วย startsWith

GET /members/q/sort?by=firstName&dir=desc
→ เรียงลำดับ (by: id/firstName/lastName/email/createdAt)
```

### Search Endpoint
```
GET /members/search?keyword=สม&email=gmail&phone=081&sort=firstName&order=asc
→ ค้นหาแบบรวม + เรียงลำดับ
```

**Response Format (Query Demo):**
```json
{
  "status": "success",
  "concept": "where + text operators (contains, OR)",
  "description": "ค้นหาชื่อหรือนามสกุลที่มีคำนี้อยู่",
  "where": { "OR": [...] },
  "data": [...]
}
```

**Response Format (Search):**
```json
{
  "status": "success",
  "message": "ค้นหาสมาชิกสำเร็จ",
  "total": 5,
  "filters": { "keyword": "สม", "email": "gmail" },
  "sorting": { "sort": "firstName", "order": "asc" },
  "data": [...]
}
```

---

## 📦 Products API

### CRUD Endpoints
```
GET    /products          - ดึงสินค้าทั้งหมด (เฉพาะ isActive=true)
GET    /products/:id      - ดึงสินค้าตาม ID
POST   /products          - สร้างสินค้าใหม่
PUT    /products/:id      - แก้ไขสินค้า
DELETE /products/:id      - ลบสินค้า
```

### Query Demo Endpoints
```
GET /products/q/projection
→ Select เฉพาะ: id, name, price, stock

GET /products/q/price-range?min=100&max=500
→ กรองช่วงราคาด้วย gte, lte

GET /products/q/stock-filter?inStock=true
→ กรองสต็อก (true: stock > 0, false: stock <= 0)

GET /products/q/category?category=อาหาร
→ กรองหมวดหมู่ด้วย contains

GET /products/q/sort?by=price&dir=desc
→ เรียงลำดับ (by: id/name/price/stock/createdAt)
```

### Search Endpoint
```
GET /products/search?keyword=ข้าว&category=อาหาร&minPrice=10&maxPrice=100&inStock=true&sort=price&order=asc
→ ค้นหาแบบรวม + กรอง isActive=true อัตโนมัติ
```

---

## 🛒 Orders API

### CRUD Endpoints
```
GET    /orders            - ดึงคำสั่งซื้อทั้งหมด (เรียง orderDate desc)
GET    /orders/:id        - ดึงคำสั่งซื้อตาม ID
POST   /orders            - สร้างคำสั่งซื้อใหม่ (สร้าง orderNumber อัตโนมัติ)
PUT    /orders/:id        - แก้ไขคำสั่งซื้อ
DELETE /orders/:id        - ลบคำสั่งซื้อ
```

### Query Demo Endpoints
```
GET /orders/q/projection
→ Select เฉพาะ: id, orderNumber, customerName, totalAmount, status

GET /orders/q/status?status=pending
→ กรองสถานะ (pending/completed/cancelled)

GET /orders/q/amount-range?min=100&max=5000
→ กรองช่วงยอดเงินด้วย gte, lte

GET /orders/q/date-range?startDate=2024-01-01&endDate=2024-12-31
→ กรองช่วงวันที่ด้วย gte, lt (+1 day)

GET /orders/q/sort?by=orderDate&dir=desc
→ เรียงลำดับ (by: id/orderNumber/customerName/totalAmount/orderDate/createdAt)
```

### Search Endpoint
```
GET /orders/search?keyword=ORD123&status=pending&minAmount=100&maxAmount=5000&startDate=2024-01-01&endDate=2024-12-31&sort=orderDate&order=desc
→ ค้นหา customerName หรือ orderNumber (OR) + กรองตามเงื่อนไข
```

---

## 🔍 Prisma Query Concepts

### 1. Select (Projection)
เลือกเฉพาะคอลัมน์ที่ต้องการ

```javascript
const select = {
  id: true,
  firstName: true,
  lastName: true,
  email: true
};

await prisma.member.findMany({ select });
```

---

### 2. Where - Text Operators

#### contains - ค้นหาข้อความ
```javascript
where: {
  email: { contains: 'gmail', mode: 'insensitive' }
}
```

#### startsWith - ขึ้นต้นด้วย
```javascript
where: {
  phone: { startsWith: '081' }
}
```

#### OR - ค้นหาหลายฟิลด์
```javascript
where: {
  OR: [
    { firstName: { contains: 'สม', mode: 'insensitive' } },
    { lastName: { contains: 'สม', mode: 'insensitive' } }
  ]
}
```

---

### 3. Where - Number Operators

#### gte (>=) และ lte (<=)
```javascript
where: {
  price: {
    gte: 100,  // มากกว่าหรือเท่ากับ
    lte: 500   // น้อยกว่าหรือเท่ากับ
  }
}
```

#### gt (>) และ lte (<=)
```javascript
// มีสินค้า
where: { stock: { gt: 0 } }

// สินค้าหมด
where: { stock: { lte: 0 } }
```

---

### 4. Where - Date Operators

```javascript
where: {
  orderDate: {
    gte: new Date('2024-01-01'),      // ตั้งแต่วันนี้
    lt: new Date('2024-02-01')        // ก่อนวันนี้
  }
}
```

**การจัดการวันสุดท้าย:**
```javascript
if (endDate) {
  const end = new Date(endDate);
  end.setDate(end.getDate() + 1);  // +1 วัน
  where.orderDate.lt = end;         // < วันถัดไป = รวมวันสุดท้าย
}
```

---

### 5. OrderBy (Sorting)

```javascript
const orderBy = { firstName: 'asc' };   // น้อย → มาก (A → Z)
const orderBy = { price: 'desc' };      // มาก → น้อย (Z → A)

await prisma.member.findMany({ orderBy });
```

**Allowed Fields Validation:**
```javascript
const allowedFields = ['id', 'firstName', 'lastName', 'email', 'createdAt'];
const sortField = allowedFields.includes(by) ? by : 'id';
```

---

### 6. Combining Where + OrderBy

```javascript
const where = {
  OR: [
    { firstName: { contains: keyword, mode: 'insensitive' } },
    { lastName: { contains: keyword, mode: 'insensitive' } }
  ],
  email: { contains: email, mode: 'insensitive' }
};

const orderBy = { firstName: 'asc' };

await prisma.member.findMany({ where, orderBy });
```

---

## 💡 Response Patterns

### Query Demo Response
แสดง Prisma Object ที่ใช้

```json
{
  "status": "success",
  "concept": "where + number operators (gte, lte)",
  "description": "กรองช่วงราคา (gte = มากกว่าเท่ากับ, lte = น้อยกว่าเท่ากับ)",
  "where": {
    "price": {
      "gte": 100,
      "lte": 500
    }
  },
  "data": [...]
}
```

### Search Response
แสดงผลลัพธ์และเงื่อนไข

```json
{
  "status": "success",
  "message": "ค้นหาสินค้าสำเร็จ",
  "total": 5,
  "filters": {
    "keyword": "ข้าว",
    "category": "อาหาร",
    "minPrice": 10,
    "maxPrice": 100,
    "inStock": "true"
  },
  "sorting": {
    "sort": "price",
    "order": "asc"
  },
  "data": [...]
}
```

### CRUD Response
```json
{
  "status": "success",
  "message": "ดึงข้อมูลสมาชิกสำเร็จ",
  "total": 10,
  "data": [...]
}
```

---

## 🎯 Key Implementation Details

### 1. Conditional Where Building
```javascript
const where = {};

if (keyword) {
  where.OR = [
    { firstName: { contains: keyword, mode: 'insensitive' } },
    { lastName: { contains: keyword, mode: 'insensitive' } }
  ];
}

if (email) {
  where.email = { contains: email, mode: 'insensitive' };
}
```

### 2. Query String Conversion
```javascript
const min = req.query.min ? parseFloat(req.query.min) : undefined;
const max = req.query.max ? parseFloat(req.query.max) : undefined;
```

### 3. Date Handling
```javascript
const startDate = req.query.startDate;
const endDate = req.query.endDate;

if (startDate) {
  where.orderDate = { gte: new Date(startDate) };
}

if (endDate) {
  const end = new Date(endDate);
  end.setDate(end.getDate() + 1);
  where.orderDate.lt = end;
}
```

### 4. Auto-generated Order Number
```javascript
function generateOrderNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
}
```

---

## 📝 Route Order (สำคัญ!)

**Query Demo Routes ต้องอยู่เหนือ `/:id`**

```javascript
// ✅ ถูกต้อง
router.get('/q/projection', controller.qProjection);
router.get('/q/name-search', controller.qNameSearch);
router.get('/search', controller.searchMembers);
router.get('/', controller.getMembers);
router.get('/:id', controller.getMemberById);  // อยู่ล่างสุด

// ❌ ผิด
router.get('/:id', controller.getMemberById);   // อยู่บนสุด จะ match ทุกอย่าง
router.get('/q/projection', controller.qProjection);  // ไม่ทำงาน!
```

---

## 🧪 ตัวอย่างการใช้งาน

### Members - Name Search
```bash
GET /members/q/name-search?keyword=สม

Response:
{
  "status": "success",
  "concept": "where + text operators (contains, OR)",
  "where": {
    "OR": [
      { "firstName": { "contains": "สม", "mode": "insensitive" } },
      { "lastName": { "contains": "สม", "mode": "insensitive" } }
    ]
  },
  "data": [
    { "id": 1, "firstName": "สมชาย", "lastName": "ใจดี", ... }
  ]
}
```

### Products - Price Range
```bash
GET /products/q/price-range?min=100&max=500

Response:
{
  "status": "success",
  "concept": "where + number operators (gte, lte)",
  "where": {
    "price": { "gte": 100, "lte": 500 }
  },
  "data": [...]
}
```

### Orders - Search
```bash
GET /orders/search?keyword=ORD&status=pending&sort=orderDate&order=desc

Response:
{
  "status": "success",
  "total": 3,
  "filters": {
    "keyword": "ORD",
    "status": "pending"
  },
  "sorting": {
    "sort": "orderDate",
    "order": "desc"
  },
  "data": [...]
}
```

---

## 📚 สรุปแนวคิดการสอน

### Query Demo Endpoints
**จุดประสงค์:** สอน Prisma Query ทีละแนวคิด

- แต่ละ endpoint เน้น 1 แนวคิด
- Response แสดง Prisma object ที่ใช้
- นักศึกษาเห็นความสัมพันธ์ระหว่าง Query String กับ Prisma Query

### Search Endpoint  
**จุดประสงค์:** แสดงการใช้งานจริง

- รวมหลายแนวคิดเข้าด้วยกัน
- พร้อมใช้งาน Production
- แสดงวิธีจัดการ Query String หลายตัว

### Standard CRUD
**จุดประสงค์:** การจัดการข้อมูลพื้นฐาน

- ไม่มี Filter (ยกเว้น Products กรอง isActive)
- เรียงลำดับ default (createdAt/orderDate desc)
- Response แบบมาตรฐาน

---