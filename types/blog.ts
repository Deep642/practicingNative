export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  tags: string[];
  imageUrl?: string;
  readTime: number;
  likedBy?: string[]; // Array of user IDs who liked the post
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
  replies?: Comment[];
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}