import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true },
  role: String,
  lastLogin: Number,
  avatar: String
});

const patternSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  imageUrl: String,
  prompt: String,
  timestamp: Number,
  palette: Array,
  author: String,
  likes: Number,
  referenceMockupUrl: String,
  fullViewMockupUrl: String
});

const logSchema = new mongoose.Schema({
  id: { type: String, required: true },
  userId: String,
  userName: String,
  action: String,
  detail: String,
  timestamp: Number,
  type: String
});

export const User = mongoose.model('User', userSchema);
export const Pattern = mongoose.model('Pattern', patternSchema);
export const ActivityLog = mongoose.model('ActivityLog', logSchema);