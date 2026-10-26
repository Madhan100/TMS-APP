const Block = require('../models/Block');

exports.createBlock = async (req, res) => {
  try {
    let { name, department, departmentId, programme, programmeId, description } = req.body;
    const dept = department || departmentId;
    const prog = programme || programmeId || undefined;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Please provide block name', error: 'Block name is required' });
    }

    if (!dept) {
      return res.status(400).json({ message: 'Please select a department', error: 'Department is required for block' });
    }

    const block = new Block({
      name: name.trim(),
      department: dept,
      programme: prog,
      description: description ? description.trim() : '',
    });

    await block.save();
    const populated = await Block.findById(block._id).populate('department').populate('programme');
    res.status(201).json({ message: 'Block created successfully', block: populated });
  } catch (error) {
    console.error('Create Block Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A block with this name already exists in this department',
        error: 'Duplicate block record',
      });
    }
    res.status(400).json({ message: error.message || 'Failed to create block', error: error.message });
  }
};

exports.getBlocks = async (req, res) => {
  try {
    const { departmentId, department, programmeId, programme } = req.query;
    const query = { isActive: true };
    const dept = departmentId || department;
    const prog = programmeId || programme;
    if (dept) query.department = dept;
    if (prog) query.programme = prog;

    const blocks = await Block.find(query).populate('department').populate('programme');
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch blocks', error: error.message });
  }
};

exports.getBlockById = async (req, res) => {
  try {
    const block = await Block.findById(req.params.id).populate('department').populate('programme');
    if (!block) {
      return res.status(404).json({ message: 'Block not found' });
    }
    res.json(block);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch block', error: error.message });
  }
};

exports.updateBlock = async (req, res) => {
  try {
    const { name, department, departmentId, programme, programmeId, description } = req.body;
    const dept = department || departmentId;
    const prog = programme || programmeId;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (dept) updateData.department = dept;
    if (prog !== undefined) updateData.programme = prog || null;
    if (description !== undefined) updateData.description = description ? description.trim() : '';

    const block = await Block.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('department').populate('programme');

    if (!block) {
      return res.status(404).json({ message: 'Block not found' });
    }
    res.json({ message: 'Block updated successfully', block });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to update block', error: error.message });
  }
};

exports.deleteBlock = async (req, res) => {
  try {
    const block = await Block.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!block) {
      return res.status(404).json({ message: 'Block not found' });
    }
    res.json({ message: 'Block deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete block', error: error.message });
  }
};
