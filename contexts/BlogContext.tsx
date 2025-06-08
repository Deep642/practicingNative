import React, { createContext, useContext, useState, useEffect } from 'react';
import { BlogPost, Comment } from '@/types/blog';
import { db } from '@/firebase';
import { collection, getDocs, doc, updateDoc, increment, addDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface BlogContextType {
  posts: BlogPost[];
  loading: boolean;
  searchQuery: string;
  filteredPosts: BlogPost[];
  setSearchQuery: (query: string) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  getComments: (postId: string) => Comment[];
  refreshPosts: () => void;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export function BlogProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    // Listen to posts collection in Firestore
    const unsubscribe = onSnapshot(collection(db, 'posts'), (snapshot) => {
      const postsData: BlogPost[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
      setPosts(postsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Listen to comments for each post in real time
    if (!posts.length) return;
    const unsubscribes = posts.map(post =>
      onSnapshot(collection(db, 'posts', post.id, 'comments'), (snapshot) => {
        setComments(prev => ({
          ...prev,
          [post.id]: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)),
        }));
      })
    );
    return () => unsubscribes.forEach(unsub => unsub());
  }, [posts]);

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleLike = async (postId: string) => {
    if (!user) return;
    const postRef = doc(db, 'posts', postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) return;
    const post = postSnap.data() as BlogPost;
    const likedBy = post.likedBy || [];
    const isLiked = likedBy.includes(user.id);
    await updateDoc(postRef, {
      likesCount: increment(isLiked ? -1 : 1),
      likedBy: isLiked
        ? likedBy.filter((uid: string) => uid !== user.id)
        : [...likedBy, user.id],
    });
  };

  const addComment = async (postId: string, content: string) => {
    if (!user) return;
    const comment: Comment = {
      id: Date.now().toString(),
      content,
      author: user,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLiked: false,
    };
    await addDoc(collection(db, 'posts', postId, 'comments'), comment);
    // Optionally increment commentsCount
    await updateDoc(doc(db, 'posts', postId), { commentsCount: increment(1) });
  };

  const getComments = (postId: string) => {
    // This should be implemented with a Firestore listener in the component
    return comments[postId] || [];
  };

  const refreshPosts = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, 'posts'));
    const postsData: BlogPost[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
    setPosts(postsData);
    setLoading(false);
  };

  return (
    <BlogContext.Provider value={{
      posts,
      loading,
      searchQuery,
      filteredPosts,
      setSearchQuery,
      toggleLike,
      addComment,
      getComments,
      refreshPosts,
    }}>
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
}