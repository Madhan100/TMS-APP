require('dotenv').config();
const mongoose = require('mongoose');

const Department = require('../models/Department');
const Programme = require('../models/Programme');
const Block = require('../models/Block');
const Room = require('../models/Room');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tms';

async function seedCampus() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Departments from Photo 1
    const deptList = [
      { name: 'Computer Studies', shortName: 'CS', description: 'Department of Computer Studies' },
      { name: 'Commerce', shortName: 'COM', description: 'Department of Commerce' },
      { name: 'Life Science', shortName: 'LS', description: 'Department of Life Science' },
      { name: 'Electronics', shortName: 'ELE', description: 'Department of Electronics' },
      { name: 'Mathematics', shortName: 'MATH', description: 'Department of Mathematics' },
      { name: 'English', shortName: 'ENG', description: 'Department of English' },
      { name: 'Tamil', shortName: 'TAM', description: 'Department of Tamil' },
    ];

    // Remove obsolete test departments (like mistakenly added BCA as a department, or ADM001)
    await Department.deleteMany({
      $or: [
        { name: 'Bachelor of Computer Application' },
        { shortName: 'ADM001' },
        { shortName: 'BCA' },
      ],
    });

    const deptMap = {};
    for (const d of deptList) {
      const doc = await Department.findOneAndUpdate(
        { shortName: d.shortName },
        { ...d, isActive: true },
        { upsert: true, new: true }
      );
      deptMap[d.name] = doc;
      deptMap[d.shortName] = doc;
    }
    console.log('Seeded 7 Departments');

    // 2. Programmes from Photo 2 & 3
    const progList = [
      // Computer Studies
      { name: 'Bachelor of Computer Application', shortName: 'BCA', dept: 'Computer Studies' },
      { name: 'Bachelor of Computer Science', shortName: 'B.SC.CS', dept: 'Computer Studies' },
      { name: 'Bachelor Of Information Technology', shortName: 'B.SC.IT', dept: 'Computer Studies' },
      { name: 'Bachelor of Data Science', shortName: 'B.SC.DS', dept: 'Computer Studies' },
      { name: 'Master of Computer Application', shortName: 'MCA', dept: 'Computer Studies' },
      { name: 'Master of Computer Science', shortName: 'MSC.CS', dept: 'Computer Studies' },
      { name: 'Master of Information Technology', shortName: 'MSC.IT', dept: 'Computer Studies' },

      // Commerce
      { name: 'Bachelor of Commerce', shortName: 'B.COM', dept: 'Commerce' },
      { name: 'Bachelor of Commerce(Computer Application)', shortName: 'B.COM.CA', dept: 'Commerce' },
      { name: 'Bachelor of Commerce(Professional Accounting)', shortName: 'B.COM.PA', dept: 'Commerce' },
      { name: 'Master of Commerce', shortName: 'M.COM', dept: 'Commerce' },
      { name: 'Master of Commerce(Computer Applications)', shortName: 'M.COM.CA', dept: 'Commerce' },
      { name: 'Master of Commerce(International Business)', shortName: 'M.COM.IB', dept: 'Commerce' },

      // Electronics
      { name: 'Bachelor of Science Electronics', shortName: 'B.SC.E', dept: 'Electronics' },

      // Mathematics
      { name: 'Bachelor of Science Mathematics', shortName: 'B.SC.MS', dept: 'Mathematics' },
      { name: 'Master of Science Mathematics', shortName: 'M.SC.MS', dept: 'Mathematics' },

      // English
      { name: 'Bachelor of Arts English Literature', shortName: 'B.A.ENG', dept: 'English' },
      { name: 'Master of Arts English Literature', shortName: 'M.A.ENG', dept: 'English' },
      { name: 'Bachelor of English', shortName: 'B.ED.ENG', dept: 'English' },

      // Tamil
      { name: 'Bachelor of Education', shortName: 'B.ED.TAM', dept: 'Tamil' },
    ];

    const progMap = {};
    for (const p of progList) {
      const deptDoc = deptMap[p.dept];
      if (deptDoc) {
        const doc = await Programme.findOneAndUpdate(
          { name: p.name, department: deptDoc._id },
          { name: p.name, shortName: p.shortName, department: deptDoc._id, isActive: true },
          { upsert: true, new: true }
        );
        progMap[p.name] = doc;
      }
    }
    console.log(`Seeded ${progList.length} Programmes`);

    // 3. Blocks from Photo 4
    const blockList = [
      { name: 'AH', dept: 'Computer Studies', prog: 'Bachelor of Computer Science' },
      { name: 'S', dept: 'Commerce', prog: 'Bachelor of Commerce' },
      { name: 'R', dept: 'Electronics', prog: 'Bachelor of Science Electronics' },
      { name: 'Q', dept: 'English', prog: 'Bachelor of Arts English Literature' },
    ];

    const blockMap = {};
    for (const b of blockList) {
      const deptDoc = deptMap[b.dept];
      const progDoc = progMap[b.prog];
      if (deptDoc) {
        const doc = await Block.findOneAndUpdate(
          { name: b.name, department: deptDoc._id },
          {
            name: b.name,
            department: deptDoc._id,
            programme: progDoc ? progDoc._id : undefined,
            isActive: true,
          },
          { upsert: true, new: true }
        );
        blockMap[b.name] = doc;
      }
    }
    console.log('Seeded 4 Blocks');

    // 4. Rooms from Photo 5
    // Block AH: 101-107
    const blockAH = blockMap['AH'];
    const deptCS = deptMap['Computer Studies'];
    const progCS = progMap['Bachelor of Computer Science'];

    if (blockAH && deptCS) {
      for (const roomNum of ['101', '102', '103', '104', '105', '106', '107']) {
        await Room.findOneAndUpdate(
          { roomNumber: roomNum, block: blockAH._id },
          {
            roomNumber: roomNum,
            block: blockAH._id,
            department: deptCS._id,
            programme: progCS ? progCS._id : undefined,
            floor: 1,
            isActive: true,
          },
          { upsert: true, new: true }
        );
      }
    }

    // Block S: 101-103
    const blockS = blockMap['S'];
    const deptCOM = deptMap['Commerce'];
    const progCOM = progMap['Bachelor of Commerce'];

    if (blockS && deptCOM) {
      for (const roomNum of ['101', '102', '103']) {
        await Room.findOneAndUpdate(
          { roomNumber: roomNum, block: blockS._id },
          {
            roomNumber: roomNum,
            block: blockS._id,
            department: deptCOM._id,
            programme: progCOM ? progCOM._id : undefined,
            floor: 1,
            isActive: true,
          },
          { upsert: true, new: true }
        );
      }
    }

    // Block R: 101-102
    const blockR = blockMap['R'];
    const deptELE = deptMap['Electronics'];
    if (blockR && deptELE) {
      for (const roomNum of ['101', '102']) {
        await Room.findOneAndUpdate(
          { roomNumber: roomNum, block: blockR._id },
          {
            roomNumber: roomNum,
            block: blockR._id,
            department: deptELE._id,
            floor: 1,
            isActive: true,
          },
          { upsert: true, new: true }
        );
      }
    }

    // Block Q: 101-102
    const blockQ = blockMap['Q'];
    const deptENG = deptMap['English'];
    if (blockQ && deptENG) {
      for (const roomNum of ['101', '102']) {
        await Room.findOneAndUpdate(
          { roomNumber: roomNum, block: blockQ._id },
          {
            roomNumber: roomNum,
            block: blockQ._id,
            department: deptENG._id,
            floor: 1,
            isActive: true,
          },
          { upsert: true, new: true }
        );
      }
    }
    console.log('Seeded Rooms for Blocks AH, S, R, Q');

    console.log('CAMPUS DATA SEEDING COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding campus data:', err);
    process.exit(1);
  }
}

seedCampus();
