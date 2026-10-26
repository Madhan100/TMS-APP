require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Department = require('../models/Department');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tms_test';

async function run() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');

    const email = process.argv[2];
    const password = process.argv[3];
    const username = process.argv[4];
    const role = process.argv[5] || 'User';
    const deptName = process.argv[6] || 'Admin Department';
    const shortName = process.argv[7] || 'ADM001';

    if (!email || !password || !username) {
      console.log('Usage: node createUser.js <email> <password> <username> [role] [deptName] [shortName]');
      console.log('Roles: SuperAdmin, User, Networking Staff, Plumber, Electrician, Software Developer, Application, PC Hardware');
      mongoose.disconnect();
      return;
    }

    // Create or find department
    let dept = await Department.findOne({ shortName });
    if (!dept) {
      dept = await Department.create({ name: deptName, shortName });
      console.log('Created department:', dept._id);
    } else {
      console.log('Department exists:', dept._id);
    }

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      console.log('User already exists:', user._id);
      console.log('Email:', user.email, 'Username:', user.username, 'Role:', user.role);
      mongoose.disconnect();
      return;
    }

    // Create new user with hashed password
    const hashed = await bcrypt.hash(password, 10);
    user = await User.create({
      username,
      email,
      phone: '0000000000',
      password: hashed,
      role,
      department: dept._id
    });

    console.log('✅ User created successfully!');
    console.log('   ID:', user._id);
    console.log('   Email:', user.email);
    console.log('   Username:', user.username);
    console.log('   Role:', user.role);
    console.log('   Department:', dept.name);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    mongoose.disconnect();
  }
}

run();
