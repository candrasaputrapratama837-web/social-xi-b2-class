import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  authorName: { type: String, required: true },
  text: { type: String, required: true }
}, { timestamps: true });

const forumPostSchema = new mongoose.Schema({
  authorName: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'Umum' },
  likes: { type: Number, default: 0 },
  comments: [commentSchema],
  branchId: { type: String, required: true }
}, { timestamps: true });

export const ForumPost = mongoose.model('ForumPost', forumPostSchema);
