const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /members - ดึงสมาชิกทั้งหมด
exports.getMembers = async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      status: 'success',
      message: 'ดึงข้อมูลสมาชิกสำเร็จ',
      total: members.length,
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

// GET /members/q/projection - Projection
exports.qProjection = async (req, res) => {
  try {
    const select = {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    };

    const members = await prisma.member.findMany({ select });

    res.json({
      status: 'success',
      concept: 'projection (select)',
      description: 'เลือกเฉพาะคอลัมน์ที่ต้องการส่งกลับ',
      select,
      data: members,
    });
  } catch (error) {
    console.error('Error in qProjection:', error);
    res.status(500).json({
      status: 'error',
      message: 'Projection query failed',
    });
  }
};

// GET /members/q/name-search - Name Search
exports.qNameSearch = async (req, res) => {
  try {
    const { keyword } = req.query;

    const where = {};

    if (keyword) {
      where.OR = [
        { firstName: { contains: keyword, mode: 'insensitive' } },
        { lastName: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const members = await prisma.member.findMany({ where });

    res.json({
      status: 'success',
      concept: 'where + text operators (contains, OR)',
      description: 'ค้นหาชื่อหรือนามสกุลที่มีคำนี้อยู่ (ไม่สนใจตัวพิมพ์เล็ก-ใหญ่)',
      where,
      data: members,
    });
  } catch (error) {
    console.error('Error in qNameSearch:', error);
    res.status(500).json({
      status: 'error',
      message: 'Name search query failed',
    });
  }
};

// GET /members/q/email-filter - Email Filter
exports.qEmailFilter = async (req, res) => {
  try {
    const { domain } = req.query;

    const where = {};

    if (domain) {
      where.email = { contains: domain, mode: 'insensitive' };
    }

    const members = await prisma.member.findMany({ where });

    res.json({
      status: 'success',
      concept: 'where + text operators (contains)',
      description: 'กรองอีเมลที่มี domain นี้ เช่น gmail, yahoo',
      where,
      data: members,
    });
  } catch (error) {
    console.error('Error in qEmailFilter:', error);
    res.status(500).json({
      status: 'error',
      message: 'Email filter query failed',
    });
  }
};

// GET /members/q/phone-filter - Phone Filter
exports.qPhoneFilter = async (req, res) => {
  try {
    const { prefix } = req.query;

    const where = {};

    if (prefix) {
      where.phone = { startsWith: prefix };
    }

    const members = await prisma.member.findMany({ where });

    res.json({
      status: 'success',
      concept: 'where + text operators (startsWith)',
      description: 'กรองเบอร์โทรที่ขึ้นต้นด้วย prefix เช่น 081, 089',
      where,
      data: members,
    });
  } catch (error) {
    console.error('Error in qPhoneFilter:', error);
    res.status(500).json({
      status: 'error',
      message: 'Phone filter query failed',
    });
  }
};

// GET /members/q/sort - Sorting
exports.qSort = async (req, res) => {
  try {
    const by = req.query.by || 'id';
    const dir = req.query.dir === 'desc' ? 'desc' : 'asc';

    const allowedFields = ['id', 'firstName', 'lastName', 'email', 'createdAt'];
    const sortField = allowedFields.includes(by) ? by : 'id';

    const orderBy = { [sortField]: dir };

    const members = await prisma.member.findMany({ orderBy });

    res.json({
      status: 'success',
      concept: 'orderBy (sorting)',
      description: 'เรียงลำดับข้อมูล (asc = น้อย→มาก, desc = มาก→น้อย)',
      orderBy,
      data: members,
    });
  } catch (error) {
    console.error('Error in qSort:', error);
    res.status(500).json({
      status: 'error',
      message: 'Sort query failed',
    });
  }
};

// GET /members/search - Real-world Search
exports.searchMembers = async (req, res) => {
  try {
    const { keyword, email, phone, sort, order } = req.query;

    const where = {};

    if (keyword) {
      where.OR = [
        { firstName: { contains: keyword, mode: 'insensitive' } },
        { lastName: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }

    if (phone) {
      where.phone = { contains: phone };
    }

    const allowedSortFields = ['firstName', 'lastName', 'email', 'createdAt'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'firstName';
    const sortOrder = order === 'desc' ? 'desc' : 'asc';

    const orderBy = { [sortField]: sortOrder };

    const members = await prisma.member.findMany({
      where,
      orderBy,
    });

    res.json({
      status: 'success',
      message: 'ค้นหาสมาชิกสำเร็จ',
      total: members.length,
      filters: { keyword, email, phone },
      sorting: { sort: sortField, order: sortOrder },
      data: members,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      status: 'error',
      message: 'เกิดข้อผิดพลาดในการค้นหา',
    });
  }
};