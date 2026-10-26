require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Department = require('../models/Department');
const Role = require('../models/Role');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tms-complaints';

async function seedStaff() {
  try {
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Ensure departments exist
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

    // Ensure all roles exist
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
    console.log('Roles verified/updated');

    const hashedPassword = await bcrypt.hash('User@123', 10);

    // List of staff accounts to create or update
    const staffList = [
      {
        username: 'network_staff',
        email: 'network@example.com',
        phone: '9876543212',
        password: hashedPassword,
        role: 'Networking Staff',
        department: deptCse._id,
        isActive: true,
      },
      {
        username: 'plumber_staff',
        email: 'plumber@example.com',
        phone: '9876543213',
        password: hashedPassword,
        role: 'Plumber',
        department: deptAdmin._id,
        isActive: true,
      },
      {
        username: 'electrician_staff',
        email: 'electrician@example.com',
        phone: '9876543214',
        password: hashedPassword,
        role: 'Electrician',
        department: deptEee._id,
        isActive: true,
      },
      {
        username: 'dev_staff',
        email: 'developer@example.com',
        phone: '9876543215',
        password: hashedPassword,
        role: 'Software Developer',
        department: deptCse._id,
        isActive: true,
      },
      {
        username: 'hardware_staff',
        email: 'hardware@example.com',
        phone: '9876543216',
        password: hashedPassword,
        role: 'PC Hardware',
        department: deptCse._id,
        isActive: true,
      },
      {
        username: 'app_staff',
        email: 'application@example.com',
        phone: '9876543217',
        password: hashedPassword,
        role: 'Application',
        department: deptCse._id,
        isActive: true,
      },
    ];

    console.log('\nCreating/Updating Staff Accounts...');
    for (const staff of staffList) {
      const updatedUser = await User.findOneAndUpdate(
        { email: staff.email },
        staff,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`✅ [${updatedUser.role}] Email: ${updatedUser.email} | Username: ${updatedUser.username} | Password: User@123`);
    }

    console.log('\nAll staff accounts created successfully!');
  } catch (error) {
    console.error('❌ Error seeding staff:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

seedStaff();
