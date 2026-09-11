import { ForumPost } from '../models/ForumPost';
import { getIsMongoConnected } from '../config/database';
import { inMemoryStore } from '../store/inMemoryStore';

export class ForumRepository {
  async findAll(branchId: string): Promise<any[]> {
    if (!getIsMongoConnected()) {
      return inMemoryStore.getForum(branchId);
    }
    try {
      return await ForumPost.find({ branchId }).sort({ createdAt: -1 }).lean();
    } catch {
      return inMemoryStore.getForum(branchId);
    }
  }

  async create(data: any): Promise<any> {
    const memoryPost = inMemoryStore.createForumPost(data);
    if (!getIsMongoConnected()) {
      return memoryPost;
    }
    try {
      const post = {
        _id: memoryPost._id,
        authorName: data.authorName,
        title: data.title,
        content: data.content,
        category: data.category || 'Umum',
        likes: 0,
        comments: [],
        branchId: data.branchId
      };
      const created = await ForumPost.create(post);
      return created.toObject ? created.toObject() : created;
    } catch {
      return memoryPost;
    }
  }

  async addComment(postId: string, comment: any, branchId?: string): Promise<any> {
    const memoryUpdated = inMemoryStore.addForumComment(postId, comment, branchId);
    if (!getIsMongoConnected()) {
      return memoryUpdated;
    }
    try {
      const updated = await ForumPost.findOneAndUpdate(
        { _id: postId },
        { $push: { comments: { _id: `cmt-${Date.now()}`, author: comment.author, text: comment.text, createdAt: new Date() } } },
        { new: true }
      ).lean();
      return updated || memoryUpdated;
    } catch {
      return memoryUpdated;
    }
  }

  async likePost(postId: string, branchId?: string): Promise<number> {
    const memoryLikes = inMemoryStore.likeForumPost(postId, branchId);
    if (!getIsMongoConnected()) {
      return memoryLikes;
    }
    try {
      const updated = await ForumPost.findOneAndUpdate(
        { _id: postId },
        { $inc: { likes: 1 } },
        { new: true }
      ).lean();
      return updated?.likes || memoryLikes;
    } catch {
      return memoryLikes;
    }
  }
}

export const forumRepository = new ForumRepository();

