const mongoose = require('mongoose');
const catgorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Must have an OWNER']
  },
  tasks: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Task'
    }
  ]
});

const Category = mongoose.model('Category', catgorySchema);
module.exports = { Category };
