const Complaint = require('../models/Complaint');
const User = require('../models/User');
const path = require('path');

exports.createComplaint = async (req, res) => {
  try {
    const { blockName, roomNumber, complaintType, remarks, userId } = req.body;

    if (!blockName || !roomNumber || !complaintType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Only SuperAdmin and regular Users can create complaints
    const requester = req.user || {};
    if (requester.role && !['SuperAdmin', 'User'].includes(requester.role)) {
      return res.status(403).json({ message: 'You do not have permission to create complaints' });
    }

    const complaint = new Complaint({
      blockName,
      roomNumber,
      complaintType,
      remarks,
      createdBy: req.user?.id || userId,
    });

    if (req.file) {
      complaint.attachment = `/uploads/${req.file.filename}`;
    }

    await complaint.save();

    const populated = await Complaint.findById(complaint._id)
      .populate({ path: 'createdBy', select: 'username email department', populate: { path: 'department', select: 'name' } })
      .populate({ path: 'assignedTo', select: 'username email role department', populate: { path: 'department', select: 'name' } });

    res.status(201).json({ message: 'Complaint created', complaint: populated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create complaint', error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const requester = req.user;
    if (!requester) return res.status(401).json({ message: 'Unauthorized' });

    // SuperAdmin: global stats
    if (requester.role === 'SuperAdmin') {
      const all = await Complaint.find();
      const total = all.length;
      const pending = all.filter((c) => c.status === 'Pending').length;
      const assigned = all.filter((c) => c.status === 'Assigned').length;
      const closed = all.filter((c) => c.status === 'Closed' || c.status === 'Resolved').length;
      return res.json({ total, pending, assigned, closed });
    }

    // Staff/Technician: stats for complaints assigned to them or their department
    if (!['SuperAdmin', 'User'].includes(requester.role)) {
      let filter = { assignedTo: requester.id };
      
      // If staff has a department assigned, also get complaints for all staff in that dept
      if (requester.department) {
        const sameDeptStaff = await User.find({ department: requester.department }).select('_id');
        const staffIds = sameDeptStaff.map(u => u._id);
        filter = {
          $or: [
            { assignedTo: { $in: staffIds } },
            { createdBy: requester.id }
          ]
        };
      } else {
        filter = { assignedTo: requester.id };
      }
      
      const assignedList = await Complaint.find(filter);
      const total = assignedList.length;
      const pending = assignedList.filter((c) => c.status === 'Pending').length;
      const assigned = assignedList.filter((c) => c.status === 'Assigned').length;
      const closed = assignedList.filter((c) => c.status === 'Closed' || c.status === 'Resolved').length;
      return res.json({ total, pending, assigned, closed });
    }

    // Regular User: stats for complaints created by them
    const myList = await Complaint.find({ createdBy: requester.id });
    const total = myList.length;
    const pending = myList.filter((c) => c.status === 'Pending').length;
    const assigned = myList.filter((c) => c.status === 'Assigned').length;
    const closed = myList.filter((c) => c.status === 'Closed' || c.status === 'Resolved').length;
    res.json({ total, pending, assigned, closed });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};

exports.listComplaints = async (req, res) => {
  try {
    const requester = req.user;
    if (!requester) return res.status(401).json({ message: 'Unauthorized' });

    // SuperAdmin: all complaints
    if (requester.role === 'SuperAdmin') {
      const complaints = await Complaint.find()
        .populate({ path: 'createdBy', select: 'username email department', populate: { path: 'department', select: 'name' } })
        .populate({ path: 'assignedTo', select: 'username email role department', populate: { path: 'department', select: 'name' } })
        .sort({ createdAt: -1 });
      return res.json(complaints);
    }

    // Staff/Technician: complaints assigned to them or their department
    if (!['SuperAdmin', 'User'].includes(requester.role)) {
      let filter = { assignedTo: requester.id };
      
      if (requester.department) {
        const sameDeptStaff = await User.find({ department: requester.department }).select('_id');
        const staffIds = sameDeptStaff.map(u => u._id);
        filter = {
          $or: [
            { assignedTo: { $in: staffIds } },
            { createdBy: requester.id }
          ]
        };
      }

      const complaints = await Complaint.find(filter)
        .populate({ path: 'createdBy', select: 'username email department', populate: { path: 'department', select: 'name' } })
        .populate({ path: 'assignedTo', select: 'username email role department', populate: { path: 'department', select: 'name' } })
        .sort({ createdAt: -1 });
      return res.json(complaints);
    }

    // Regular User: complaints raised by them
    const complaints = await Complaint.find({ createdBy: requester.id })
      .populate({ path: 'createdBy', select: 'username email department', populate: { path: 'department', select: 'name' } })
      .populate({ path: 'assignedTo', select: 'username email role department', populate: { path: 'department', select: 'name' } })
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Failed to list complaints', error: error.message });
  }
};

// SuperAdmin assigns complaint to a staff user
exports.assignComplaint = async (req, res) => {
  try {
    const requester = req.user;
    if (!requester || requester.role !== 'SuperAdmin') {
      return res.status(403).json({ message: 'Only SuperAdmin can assign complaints' });
    }

    const complaintId = req.params.id;
    const { assignedTo } = req.body;
    if (!assignedTo) return res.status(400).json({ message: 'assignedTo is required' });

    const assignee = await User.findById(assignedTo);
    if (!assignee) return res.status(404).json({ message: 'Assignee not found' });

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (complaint.status === 'Closed' || complaint.status === 'Resolved') {
      return res.status(400).json({ message: 'Cannot assign a closed complaint' });
    }

    complaint.assignedTo = assignee._id;
    if (complaint.status === 'Pending') {
      complaint.status = 'Assigned';
    }
    await complaint.save();

    const updated = await Complaint.findById(complaintId)
      .populate({ path: 'createdBy', select: 'username email department', populate: { path: 'department', select: 'name' } })
      .populate({ path: 'assignedTo', select: 'username email role department', populate: { path: 'department', select: 'name' } });

    res.json({ message: 'Assigned successfully', complaint: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to assign complaint', error: error.message });
  }
};

// Assigned staff (or SuperAdmin) can update status to Closed
exports.updateStatus = async (req, res) => {
  try {
    const requester = req.user;
    const complaintId = req.params.id;
    let { status } = req.body;
    if (!status) return res.status(400).json({ message: 'status is required' });

    // Accept 'Completed' as alias for 'Closed'
    if (status === 'Completed') status = 'Closed';

    const allowedStatuses = ['Pending', 'Assigned', 'In-Progress', 'Onhold', 'Closed'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const complaint = await Complaint.findById(complaintId)
      .populate('assignedTo', '_id')
      .populate('createdBy', '_id');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // If complaint is already Closed, SuperAdmin can still reopen if needed
    if (complaint.status === 'Closed' && requester.role !== 'SuperAdmin' && status === 'Closed') {
      return res.status(400).json({ message: 'Complaint is already closed' });
    }

    // SuperAdmin: allow any status update
    if (requester.role === 'SuperAdmin') {
      complaint.status = status;
      await complaint.save();
      const updated = await Complaint.findById(complaintId)
        .populate({ path: 'createdBy', select: 'username email department', populate: { path: 'department', select: 'name' } })
        .populate({ path: 'assignedTo', select: 'username email role department', populate: { path: 'department', select: 'name' } });
      return res.json({ message: 'Status updated', complaint: updated });
    }

    // Staff/Technician or creator:
    const isAssignee = complaint.assignedTo && String(complaint.assignedTo._id || complaint.assignedTo) === String(requester.id);
    const isCreator = complaint.createdBy && String(complaint.createdBy._id || complaint.createdBy) === String(requester.id);

    if (!isAssignee && !isCreator) {
      return res.status(403).json({ message: 'Only assigned staff or complaint creator can update status' });
    }

    complaint.status = status;
    await complaint.save();

    const updated = await Complaint.findById(complaintId)
      .populate({ path: 'createdBy', select: 'username email department', populate: { path: 'department', select: 'name' } })
      .populate({ path: 'assignedTo', select: 'username email role department', populate: { path: 'department', select: 'name' } });

    res.json({ message: 'Status updated', complaint: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update status', error: error.message });
  }
};

// Generate filtered reports (SuperAdmin & Staff)
exports.generateReport = async (req, res) => {
  try {
    const requester = req.user;
    if (!requester) return res.status(401).json({ message: 'Unauthorized' });

    const { department, programme, complaintType, status, assignee } = req.query;

    const filter = {};
    if (complaintType) filter.complaintType = complaintType;
    if (status) filter.status = status;
    if (assignee) filter.assignedTo = assignee;

    if (department || programme) {
      const userQuery = {};
      if (department) userQuery.department = department;
      if (programme) userQuery.programme = programme;
      const users = await User.find(userQuery).select('_id');
      const createdByFilterIds = users.map((u) => u._id);
      if (createdByFilterIds.length === 0) {
        return res.json([]);
      }
      filter.createdBy = { $in: createdByFilterIds };
    }

    const complaints = await Complaint.find(filter)
      .populate({ path: 'createdBy', select: 'username email department', populate: { path: 'department', select: 'name' } })
      .populate({ path: 'assignedTo', select: 'username email role department', populate: { path: 'department', select: 'name' } })
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate report', error: error.message });
  }
};

// Get single complaint by ID
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate({ path: 'createdBy', select: 'username email department', populate: { path: 'department', select: 'name' } })
      .populate({ path: 'assignedTo', select: 'username email role department', populate: { path: 'department', select: 'name' } });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch complaint', error: error.message });
  }
};
