const Room = require('../models/Room');
const Block = require('../models/Block');

exports.createRoom = async (req, res) => {
  try {
    let { roomNumber, department, departmentId, programme, programmeId, block, blockId, floor, capacity, description } = req.body;
    const blk = block || blockId;
    let dept = department || departmentId;
    let prog = programme || programmeId;

    if (!roomNumber || !roomNumber.toString().trim()) {
      return res.status(400).json({ message: 'Please provide room number or name', error: 'Room number is required' });
    }

    if (!blk) {
      return res.status(400).json({ message: 'Please select a block', error: 'Block is required for room' });
    }

    // Auto-inherit department & programme from block if not explicitly provided
    if (blk && (!dept || !prog)) {
      const blockDoc = await Block.findById(blk);
      if (blockDoc) {
        if (!dept && blockDoc.department) dept = blockDoc.department;
        if (!prog && blockDoc.programme) prog = blockDoc.programme;
      }
    }

    const room = new Room({
      roomNumber: roomNumber.toString().trim(),
      department: dept || undefined,
      programme: prog || undefined,
      block: blk,
      floor: floor ? Number(floor) : undefined,
      capacity: capacity ? Number(capacity) : undefined,
      description: description ? description.trim() : '',
    });

    await room.save();
    const populated = await Room.findById(room._id)
      .populate('department')
      .populate('programme')
      .populate('block');

    res.status(201).json({ message: 'Room created successfully', room: populated });
  } catch (error) {
    console.error('Create Room Error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'A room with this number already exists in this block',
        error: 'Duplicate room record',
      });
    }
    res.status(400).json({ message: error.message || 'Failed to create room', error: error.message });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const { departmentId, department, programmeId, programme, blockId, block } = req.query;
    const query = { isActive: true };
    const dept = departmentId || department;
    const prog = programmeId || programme;
    const blk = blockId || block;

    if (dept) query.department = dept;
    if (prog) query.programme = prog;
    if (blk) query.block = blk;

    const rooms = await Room.find(query)
      .populate('department')
      .populate('programme')
      .populate('block');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch rooms', error: error.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('department')
      .populate('programme')
      .populate('block');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch room', error: error.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { roomNumber, department, departmentId, programme, programmeId, block, blockId, floor, capacity, description } = req.body;
    const blk = block || blockId;
    const dept = department || departmentId;
    const prog = programme || programmeId;

    const updateData = {};
    if (roomNumber) updateData.roomNumber = roomNumber.toString().trim();
    if (blk) updateData.block = blk;
    if (dept !== undefined) updateData.department = dept || null;
    if (prog !== undefined) updateData.programme = prog || null;
    if (floor !== undefined) updateData.floor = floor ? Number(floor) : undefined;
    if (capacity !== undefined) updateData.capacity = capacity ? Number(capacity) : undefined;
    if (description !== undefined) updateData.description = description ? description.trim() : '';

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('department')
     .populate('programme')
     .populate('block');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ message: 'Room updated successfully', room });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to update room', error: error.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete room', error: error.message });
  }
};
