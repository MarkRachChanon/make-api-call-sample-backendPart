const express = require('express');
const router = express.Router();
const controller = require('../controllers/product.controller');

router.get('/q/projection',
  // #swagger.tags = ['Products - Query Demo']
  // #swagger.description = 'Projection: เลือกคอลัมน์ที่ต้องการส่งกลับ (id, name, price, stock)'
  controller.qProjection
);

router.get('/q/price-range',
  // #swagger.tags = ['Products - Query Demo']
  // #swagger.description = 'Price Range: กรองช่วงราคา (min, max) ด้วย gte, lte'
  controller.qPriceRange
);

router.get('/q/stock-filter',
  // #swagger.tags = ['Products - Query Demo']
  // #swagger.description = 'Stock Filter: กรองสินค้าในสต็อก (inStock=true/false) ด้วย gt, lte'
  controller.qStockFilter
);

router.get('/q/category',
  // #swagger.tags = ['Products - Query Demo']
  // #swagger.description = 'Category Filter: กรองหมวดหมู่ด้วย contains (category)'
  controller.qCategory
);

router.get('/q/sort',
  // #swagger.tags = ['Products - Query Demo']
  // #swagger.description = 'Sorting: เรียงลำดับข้อมูล (by=name/price/stock, dir=asc/desc)'
  controller.qSort
);

router.get('/search',
  // #swagger.tags = ['Products']
  // #swagger.description = 'ค้นหาสินค้าแบบรวม (keyword, category, minPrice, maxPrice, inStock, sort, order)'
  controller.searchProducts
);

router.get('/',
  // #swagger.tags = ['Products']
  // #swagger.description = 'ดึงสินค้าทั้งหมด'
  controller.getProducts
);

router.get('/:id',
  // #swagger.tags = ['Products']
  // #swagger.description = 'ดึงสินค้าตาม ID'
  controller.getProductById
);

router.post('/',
  // #swagger.tags = ['Products']
  // #swagger.description = 'สร้างสินค้าใหม่'
  controller.createProduct
);

router.put('/:id',
  // #swagger.tags = ['Products']
  // #swagger.description = 'แก้ไขข้อมูลสินค้า'
  controller.updateProduct
);

router.delete('/:id',
  // #swagger.tags = ['Products']
  // #swagger.description = 'ลบสินค้า'
  controller.deleteProduct
);

module.exports = router;