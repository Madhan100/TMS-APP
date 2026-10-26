const Programme = require('../models/Programme');

exports.createProgramme = async (req, res) => {
  try {
    let { name, shortName, department, departmentId, description } = req.body;
    const dept = department || departmentId;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Please provide programme name', error: 'Programme name is required' });
    }

    if (!dept) {
      return res.status(400).json({ message: 'Please select a department', error: 'Department is required for programme' });
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
      code = (code + 'PG').slice(0, 8);
    } else if (code.length > 8) {
      code = code.slice(0, 8);
    }

    const programme = new Programme({
      name: name.trim(),
      shortName: code,
      department: dept,
      description: description ? description.trim() : '',
    });

    await programme.save();
    const populated = await Programme.findById(programme._id).populate('department');
    res.status(201).json({ message: 'Programme created successfully', programme: populated });
  } catch (error) {
    console.error('Create Programme Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A programme with this name or code already exists in this department',
        error: 'Duplicate programme record',
      });
    }
    res.status(400).json({ message: error.message || 'Failed to create programme', error: error.message });
  }
};

exports.getProgrammes = async (req, res) => {
  try {
    const { departmentId, department } = req.query;
    const query = { isActive: true };
    const dept = departmentId || department;
    if (dept) {
      query.department = dept;
    }
    const programmes = await Programme.find(query).populate('department');
    res.json(programmes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch programmes', error: error.message });
  }
};

exports.getProgrammeById = async (req, res) => {
  try {
    const programme = await Programme.findById(req.params.id).populate('department');
    if (!programme) {
      return res.status(404).json({ message: 'Programme not found' });
    }
    res.json(programme);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch programme', error: error.message });
  }
};

exports.updateProgramme = async (req, res) => {
  try {
    const { name, shortName, department, departmentId, description } = req.body;
    const dept = department || departmentId;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (shortName) updateData.shortName = shortName.trim().toUpperCase();
    if (dept) updateData.department = dept;
    if (description !== undefined) updateData.description = description ? description.trim() : '';

    const programme = await Programme.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('department');

    if (!programme) {
      return res.status(404).json({ message: 'Programme not found' });
    }
    res.json({ message: 'Programme updated successfully', programme });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to update programme', error: error.message });
  }
};

exports.deleteProgramme = async (req, res) => {
  try {
    const programme = await Programme.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!programme) {
      return res.status(404).json({ message: 'Programme not found' });
    }
    res.json({ message: 'Programme deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete programme', error: error.message });
  }
};
