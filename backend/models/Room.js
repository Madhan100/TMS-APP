const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Please provide room number'],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: false,
    },
    programme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Programme',
      required: false,
    },
    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Block',
      required: true,
    },
    floor: Number,
    capacity: Number,
    description: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

roomSchema.index({ roomNumber: 1, block: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);
