const Department = require('../models/Department');

exports.createDepartment = async (req, res) => {
  try {
    let { name, shortName, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Please provide department name', error: 'Department name is required' });
    }

    let code = (shortName || '').trim().toUpperCase();
    if (!code) {
      const words = name.trim().split(/\s+/);
      if (words.length > 1) {
        code = words.map(w => w[0]).join('').slice(0, 6).toUpperCase();
      } else {
        code = name.trim().slice(0, 4).toUpperCase();
      }
    }

    if (code.length < 2) {
      code = (code + 'DP').slice(0, 8);
    } else if (code.length > 8) {
      code = code.slice(0, 8);
    }

    const department = new Department({
      name: name.trim(),
      shortName: code,
      description: description ? description.trim() : '',
    });

    await department.save();
    res.status(201).json({ message: 'Department created successfully', department });
  } catch (error) {
    console.error('Create Department Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A department with this name or code already exists',
        error: 'Duplicate department record',
      });
    }
    res.status(400).json({ message: error.message || 'Failed to create department', error: error.message });
  }
};

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch departments', error: error.message });
  }
};

exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch department', error: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { name, shortName, description } = req.body;
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, shortName, description },
      { new: true, runValidators: true }
    );
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json({ message: 'Department updated successfully', department });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update department', error: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete department', error: error.message });
  }
};
