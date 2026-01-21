const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /products - ดึงสินค้าทั้งหมด
exports.getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      status: 'success',
      message: 'ดึงข้อมูลสินค้าสำเร็จ',
      total: products.length,
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
        stock: stock !== undefined ? parseInt(stock, 10) : undefined,
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

// GET /products/q/projection - Projection
exports.qProjection = async (req, res) => {
  try {
    const select = {
      id: true,
      name: true,
      price: true,
      stock: true,
    };

    const products = await prisma.product.findMany({ select });

    res.json({
      status: 'success',
      concept: 'projection (select)',
      description: 'เลือกเฉพาะคอลัมน์ที่ต้องการส่งกลับ',
      select,
      data: products,
    });
  } catch (error) {
    console.error('Error in qProjection:', error);
    res.status(500).json({
      status: 'error',
      message: 'Projection query failed',
    });
  }
};

// GET /products/q/price-range - Price Range
exports.qPriceRange = async (req, res) => {
  try {
    const min = req.query.min ? parseFloat(req.query.min) : undefined;
    const max = req.query.max ? parseFloat(req.query.max) : undefined;

    const where = {
      price: {
        ...(min !== undefined ? { gte: min } : {}),
        ...(max !== undefined ? { lte: max } : {}),
      },
    };

    const products = await prisma.product.findMany({ where });

    res.json({
      status: 'success',
      concept: 'where + number operators (gte, lte)',
      description: 'กรองช่วงราคา (gte = มากกว่าเท่ากับ, lte = น้อยกว่าเท่ากับ)',
      where,
      data: products,
    });
  } catch (error) {
    console.error('Error in qPriceRange:', error);
    res.status(500).json({
      status: 'error',
      message: 'Price range query failed',
    });
  }
};

// GET /products/q/stock-filter - Stock Filter
exports.qStockFilter = async (req, res) => {
  try {
    const { inStock } = req.query;

    const where = {};

    if (inStock === 'true') {
      where.stock = { gt: 0 };
    } else if (inStock === 'false') {
      where.stock = { lte: 0 };
    }

    const products = await prisma.product.findMany({ where });

    res.json({
      status: 'success',
      concept: 'where + number operators (gt, lte)',
      description: 'กรองสินค้าในสต็อก (gt = มากกว่า, lte = น้อยกว่าเท่ากับ)',
      where,
      data: products,
    });
  } catch (error) {
    console.error('Error in qStockFilter:', error);
    res.status(500).json({
      status: 'error',
      message: 'Stock filter query failed',
    });
  }
};

// GET /products/q/category - Category Filter
exports.qCategory = async (req, res) => {
  try {
    const { category } = req.query;

    const where = {};

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    const products = await prisma.product.findMany({ where });

    res.json({
      status: 'success',
      concept: 'where + text operators (contains)',
      description: 'กรองหมวดหมู่ที่มีคำนี้อยู่',
      where,
      data: products,
    });
  } catch (error) {
    console.error('Error in qCategory:', error);
    res.status(500).json({
      status: 'error',
      message: 'Category filter query failed',
    });
  }
};

// GET /products/q/sort - Sorting
exports.qSort = async (req, res) => {
  try {
    const by = req.query.by || 'id';
    const dir = req.query.dir === 'desc' ? 'desc' : 'asc';

    const allowedFields = ['id', 'name', 'price', 'stock', 'createdAt'];
    const sortField = allowedFields.includes(by) ? by : 'id';

    const orderBy = { [sortField]: dir };

    const products = await prisma.product.findMany({ orderBy });

    res.json({
      status: 'success',
      concept: 'orderBy (sorting)',
      description: 'เรียงลำดับข้อมูล (asc = น้อย→มาก, desc = มาก→น้อย)',
      orderBy,
      data: products,
    });
  } catch (error) {
    console.error('Error in qSort:', error);
    res.status(500).json({
      status: 'error',
      message: 'Sort query failed',
    });
  }
};

// GET /products/search - Real-world Search
exports.searchProducts = async (req, res) => {
  try {
    const { keyword, category, minPrice, maxPrice, inStock, sort, order } = req.query;

    const where = {};

    if (keyword) {
      where.name = { contains: keyword, mode: 'insensitive' };
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    if (inStock === 'true') {
      where.stock = { gt: 0 };
    }

    where.isActive = true;

    const allowedSortFields = ['name', 'price', 'stock', 'createdAt'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'name';
    const sortOrder = order === 'desc' ? 'desc' : 'asc';

    const orderBy = { [sortField]: sortOrder };

    const products = await prisma.product.findMany({
      where,
      orderBy,
    });

    res.json({
      status: 'success',
      message: 'ค้นหาสินค้าสำเร็จ',
      total: products.length,
      filters: { keyword, category, minPrice, maxPrice, inStock },
      sorting: { sort: sortField, order: sortOrder },
      data: products,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดในการค้นหา',
    });
  }
};