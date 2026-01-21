const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /members
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

// GET /members/:id
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

// POST /members
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

// PUT /members/:id
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

// DELETE /members/:id
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