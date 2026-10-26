const User = require('../models/User');

exports.createUser = async (req, res) => {
  try {
    let { username, email, phone, password, role, department, departmentId, programme, programmeId } = req.body;
    const dept = department || departmentId;
    const prog = programme || programmeId;

    if (!username || !username.trim()) {
      return res.status(400).json({ message: 'Username is required', error: 'Username is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required', error: 'Email is required' });
    }
    if (!password) {
      return res.status(400).json({ message: 'Password is required', error: 'Password is required' });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
      role: role || 'User',
      department: dept || undefined,
      programme: prog || undefined,
    });

    await user.save();
    const createdUser = await User.findById(user._id)
      .select('-password')
      .populate('department')
      .populate('programme');

    res.status(201).json({ message: 'User created successfully', user: createdUser });
  } catch (error) {
    console.error('Create User Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A user with this username or email already exists',
        error: 'Duplicate user account',
      });
    }
    res.status(400).json({ message: error.message || 'Failed to create user', error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { role, department } = req.query;
    const query = { isActive: true };
    if (role) query.role = role;
    if (department) query.department = department;

    const users = await User.find(query)
      .select('-password')
      .populate('department')
      .populate('programme');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('department')
      .populate('programme');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { username, email, phone, role, department, programme } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, phone, role, department, programme },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};
