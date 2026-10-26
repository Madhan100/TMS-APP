require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Department = require('../models/Department');
const Programme = require('../models/Programme');
const Block = require('../models/Block');
const Room = require('../models/Room');
const Role = require('../models/Role');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tms-complaints';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding');

    // 1. Roles
    const rolesData = [
      { name: 'SuperAdmin', description: 'Full system administrator' },
      { name: 'User', description: 'Standard user / student / staff raising complaints' },
      { name: 'Networking Staff', description: 'Resolves network & internet issues' },
      { name: 'Plumber', description: 'Resolves plumbing & water issues' },
      { name: 'Electrician', description: 'Resolves electrical issues' },
      { name: 'Software Developer', description: 'Software & portal maintenance' },
      { name: 'Application', description: 'Application support' },
      { name: 'PC Hardware', description: 'Hardware technician' },
    ];

    for (const r of rolesData) {
      await Role.findOneAndUpdate({ name: r.name }, r, { upsert: true, new: true });
    }
    console.log('Roles seeded');

    // 2. Departments
    const deptCse = await Department.findOneAndUpdate(
      { shortName: 'CSE' },
      { name: 'Computer Science and Engineering', shortName: 'CSE', description: 'CSE Department' },
      { upsert: true, new: true }
    );
    const deptEee = await Department.findOneAndUpdate(
      { shortName: 'EEE' },
      { name: 'Electrical and Electronics Engineering', shortName: 'EEE', description: 'EEE Department' },
      { upsert: true, new: true }
    );
    const deptAdmin = await Department.findOneAndUpdate(
      { shortName: 'ADM001' },
      { name: 'Admin Department', shortName: 'ADM001', description: 'Administration' },
      { upsert: true, new: true }
    );
    console.log('Departments seeded');

    // 3. Programmes
    const progBtechCse = await Programme.findOneAndUpdate(
      { shortName: 'BCSE', department: deptCse._id },
      { name: 'B.Tech Computer Science', shortName: 'BCSE', department: deptCse._id },
      { upsert: true, new: true }
    );
    const progBeEee = await Programme.findOneAndUpdate(
      { shortName: 'BEEE', department: deptEee._id },
      { name: 'B.E Electrical & Electronics', shortName: 'BEEE', department: deptEee._id },
      { upsert: true, new: true }
    );
    console.log('Programmes seeded');

    // 4. Blocks
    const blockMain = await Block.findOneAndUpdate(
      { name: 'Main Academic Block', department: deptCse._id, programme: progBtechCse._id },
      { name: 'Main Academic Block', department: deptCse._id, programme: progBtechCse._id, description: 'Main Block' },
      { upsert: true, new: true }
    );
    const blockLab = await Block.findOneAndUpdate(
      { name: 'Tech & Science Block', department: deptEee._id, programme: progBeEee._id },
      { name: 'Tech & Science Block', department: deptEee._id, programme: progBeEee._id, description: 'Tech Labs' },
      { upsert: true, new: true }
    );
    console.log('Blocks seeded');

    // 5. Rooms
    await Room.findOneAndUpdate(
      { roomNumber: 'LAB-101', block: blockMain._id },
      { roomNumber: 'LAB-101', block: blockMain._id, department: deptCse._id, programme: progBtechCse._id, floor: 1, capacity: 60 },
      { upsert: true, new: true }
    );
    await Room.findOneAndUpdate(
      { roomNumber: 'ROOM-204', block: blockMain._id },
      { roomNumber: 'ROOM-204', block: blockMain._id, department: deptCse._id, programme: progBtechCse._id, floor: 2, capacity: 40 },
      { upsert: true, new: true }
    );
    console.log('Rooms seeded');

    // 6. Users
    const hashedPassword = await bcrypt.hash('SuperAdmin@123', 10);
    const userHashedPassword = await bcrypt.hash('User@123', 10);

    // SuperAdmin
    await User.findOneAndUpdate(
      { email: 'superadmin@example.com' },
      {
        username: 'superadmin',
        email: 'superadmin@example.com',
        phone: '9876543210',
        password: hashedPassword,
        role: 'SuperAdmin',
        department: deptAdmin._id,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    // Standard User
    await User.findOneAndUpdate(
      { email: 'user@example.com' },
      {
        username: 'user1',
        email: 'user@example.com',
        phone: '9876543211',
        password: userHashedPassword,
        role: 'User',
        department: deptCse._id,
        programme: progBtechCse._id,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    // Staff Accounts
    const staffAccounts = [
      {
        username: 'network_staff',
        email: 'network@example.com',
        phone: '9876543212',
        password: userHashedPassword,
        role: 'Networking Staff',
        department: deptCse._id,
        isActive: true,
      },
      {
        username: 'plumber_staff',
        email: 'plumber@example.com',
        phone: '9876543213',
        password: userHashedPassword,
        role: 'Plumber',
        department: deptAdmin._id,
        isActive: true,
      },
      {
        username: 'electrician_staff',
        email: 'electrician@example.com',
        phone: '9876543214',
        password: userHashedPassword,
        role: 'Electrician',
        department: deptEee._id,
        isActive: true,
      },
      {
        username: 'dev_staff',
        email: 'developer@example.com',
        phone: '9876543215',
        password: userHashedPassword,
        role: 'Software Developer',
        department: deptCse._id,
        isActive: true,
      },
      {
        username: 'hardware_staff',
        email: 'hardware@example.com',
        phone: '9876543216',
        password: userHashedPassword,
        role: 'PC Hardware',
        department: deptCse._id,
        isActive: true,
      },
      {
        username: 'app_staff',
        email: 'application@example.com',
        phone: '9876543217',
        password: userHashedPassword,
        role: 'Application',
        department: deptCse._id,
        isActive: true,
      },
    ];

    for (const staff of staffAccounts) {
      await User.findOneAndUpdate(
        { email: staff.email },
        staff,
        { upsert: true, new: true }
      );
    }

    console.log('Users seeded successfully');
    console.log('--------------------------------------------------');
    console.log('Demo SuperAdmin:        superadmin@example.com  / SuperAdmin@123');
    console.log('Demo User:              user@example.com        / User@123');
    console.log('Demo Networking Staff:  network@example.com     / User@123');
    console.log('Demo Plumber:           plumber@example.com     / User@123');
    console.log('Demo Electrician:       electrician@example.com / User@123');
    console.log('Demo Software Dev:      developer@example.com   / User@123');
    console.log('Demo PC Hardware:       hardware@example.com    / User@123');
    console.log('Demo Application:       application@example.com / User@123');
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database disconnected');
  }
}

seed();
