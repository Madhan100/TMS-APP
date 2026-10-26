require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Role = require('../models/Role');
const Department = require('../models/Department');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tms';

async function seedUsersAndRoles() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Drop old indexes if lingering
    const db = mongoose.connection.db;
    try {
      await db.collection('roles').dropIndex('roleName_1');
    } catch (e) {
      // index might not exist
    }

    // 2. Roles from Photo 4 (8 TIERS ACTIVE)
    const rolesList = [
      { name: 'Networking Staff', permissions: ['manage_network', 'resolve_tickets'] },
      { name: 'Plumber', permissions: ['plumbing_maintenance', 'resolve_tickets'] },
      { name: 'Electrician', permissions: ['electrical_repairs', 'resolve_tickets'] },
      { name: 'Software Developer', permissions: ['software_dev', 'system_support'] },
      { name: 'Application', permissions: ['app_management', 'system_support'] },
      { name: 'PC Hardware', permissions: ['hardware_diagnostics', 'hardware_repair'] },
      { name: 'User', permissions: ['raise_ticket', 'view_own_tickets'] },
      { name: 'Super Admin', permissions: ['all_access', 'manage_all', 'configure_system'] },
    ];

    // Clear old roles to keep exactly 8 TIERS
    await Role.deleteMany({});
    for (const r of rolesList) {
      await Role.create({
        name: r.name,
        permissions: r.permissions,
        isActive: true,
      });
    }
    console.log(`Seeded ${rolesList.length} Roles`);

    // 3. Find Computer Studies department for linked unit
    const compDept = await Department.findOne({
      $or: [{ name: 'Computer Studies' }, { shortName: 'CS' }],
    });

    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // 4. Users from Photo 2 & 3 (8 IDENTITIES ONLINE)
    const usersList = [
      {
        username: 'network',
        email: 'network@tms.com',
        role: 'Networking Staff',
        department: null,
      },
      {
        username: 'Electrician Team',
        email: 'electrician@tms.com',
        role: 'Electrician',
        department: null,
      },
      {
        username: 'PC Hardware',
        email: 'pc@tms.com',
        role: 'PC Hardware',
        department: null,
      },
      {
        username: 'HOD',
        email: 'user@tms.com',
        role: 'User',
        department: null,
      },
      {
        username: 'Dhanzz',
        email: 'dhanyakannan276@gmail.com',
        role: 'SuperAdmin',
        department: null,
      },
      {
        username: 'PLUMBER TEAM',
        email: 'plumber@tms.com',
        role: 'Plumber',
        department: null,
      },
      {
        username: 'SOFTWARE DEV',
        email: 'software@tms.com',
        role: 'Software Developer',
        department: compDept ? compDept._id : null,
      },
      {
        username: 'dhanya',
        email: 'dhanyapvtz@gmail.com',
        role: 'User',
        department: compDept ? compDept._id : null,
      },
    ];

    // Clear old test users so we have exactly 8 IDENTITIES ONLINE
    await User.deleteMany({});

    for (const u of usersList) {
      await User.create({
        username: u.username,
        email: u.email.toLowerCase(),
        phone: '9876543210',
        password: hashedPassword,
        role: u.role,
        department: u.department || undefined,
        isActive: true,
      });
    }
    console.log(`Seeded ${usersList.length} Users`);

    console.log('USERS & ROLES SEEDING COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding users and roles:', err);
    process.exit(1);
  }
}

seedUsersAndRoles();
