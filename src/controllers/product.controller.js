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
        stock: stock ? parseInt(stock, 10) : 0,
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