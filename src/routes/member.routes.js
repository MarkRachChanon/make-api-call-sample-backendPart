const express = require('express');
const router = express.Router();
const controller = require('../controllers/member.controller');

router.get('/q/projection',
  // #swagger.tags = ['Members - Query Demo']
  // #swagger.description = 'Projection: เลือกคอลัมน์ที่ต้องการส่งกลับ (id, firstName, lastName, email)'
  controller.qProjection
);

router.get('/q/name-search',
  // #swagger.tags = ['Members - Query Demo']
  // #swagger.description = 'Name Search: ค้นหาชื่อหรือนามสกุลด้วย contains (keyword)'
  controller.qNameSearch
);

router.get('/q/email-filter',
  // #swagger.tags = ['Members - Query Demo']
  // #swagger.description = 'Email Filter: กรองอีเมลด้วย contains (domain เช่น gmail, yahoo)'
  controller.qEmailFilter
);

router.get('/q/phone-filter',
  // #swagger.tags = ['Members - Query Demo']
  // #swagger.description = 'Phone Filter: กรองเบอร์โทรด้วย startsWith (prefix เช่น 081, 089)'
  controller.qPhoneFilter
);

router.get('/q/sort',
  // #swagger.tags = ['Members - Query Demo']
  // #swagger.description = 'Sorting: เรียงลำดับข้อมูล (by=firstName/lastName/email, dir=asc/desc)'
  controller.qSort
);

router.get('/search',
  // #swagger.tags = ['Members']
  // #swagger.description = 'ค้นหาสมาชิกแบบรวม (keyword, email, phone, sort, order)'
  controller.searchMembers
);

router.get('/',
  // #swagger.tags = ['Members']
  // #swagger.description = 'ดึงสมาชิกทั้งหมด'
  controller.getMembers
);

router.get('/:id',
  // #swagger.tags = ['Members']
  // #swagger.description = 'ดึงสมาชิกตาม ID'
  controller.getMemberById
);

router.post('/',
  // #swagger.tags = ['Members']
  // #swagger.description = 'สร้างสมาชิกใหม่'
  controller.createMember
);

router.put('/:id',
  // #swagger.tags = ['Members']
  // #swagger.description = 'แก้ไขข้อมูลสมาชิก'
  controller.updateMember
);

router.delete('/:id',
  // #swagger.tags = ['Members']
  // #swagger.description = 'ลบสมาชิก'
  controller.deleteMember
);

module.exports = router;