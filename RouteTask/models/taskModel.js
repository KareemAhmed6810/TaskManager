const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required']
    },
    type: {
      type: String,
      lowercase: true,
      enum: ['text', 'list'],
      required: [true,'text or list']
    },
    text: {
      type: String,
      required: function() {
        return this.type === 'text';
      }
    },
    listItems: [
      {
        text: {
          type: String,
          required: function() {
            return this.type === 'list';
          }
        }
      }
    ],
    shared: {
      type: Boolean,
      default: false
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: true
    }
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);

module.exports = { Task };
