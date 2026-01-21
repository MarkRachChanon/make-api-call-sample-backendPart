const express = require('express');
const router = express.Router();
const controller = require('../controllers/member.controller');

router.get('/',
    // #swagger.tags = ['Members']
    // #swagger.description = 'ดึงสมาชิกทั้งหมด'
    controller.getMembers);
router.get('/:id', 
    // #swagger.tags = ['Members']
    // #swagger.description = 'ดึงสมาชิกตาม ID ที่เราเลือกตามที่ระบุใน Field'
    controller.getMemberById);
router.post('/', controller.createMember);
router.put('/:id', controller.updateMember);
router.delete('/:id', controller.deleteMember);

module.exports = router;