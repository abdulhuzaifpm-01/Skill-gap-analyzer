const mongoose = require('mongoose');

const jobRoleSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    requiredSkills: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobRole', jobRoleSchema);
