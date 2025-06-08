import React, { createContext, useContext, useState, useEffect } from 'react';
import { BlogPost, Comment } from '@/types/blog';
import { db, auth } from '@/firebase';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
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

  const mockPosts: BlogPost[] = [
    {
      id: '1',
      title: 'The Future of Web Development: What to Expect in 2025',
      content: 'Web development continues to evolve at a rapid pace. From new frameworks to innovative design patterns, 2025 promises to bring exciting changes to how we build and interact with web applications...',
      excerpt: 'Exploring the latest trends and technologies shaping the future of web development.',
      author: {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        followersCount: 2500,
        followingCount: 180,
        postsCount: 45,
      },
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
      likesCount: 127,
      commentsCount: 23,
      isLiked: false,
      tags: ['Web Development', 'Technology', 'Future'],
      imageUrl: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=2',
      readTime: 8,
    },
    {
      id: '2',
      title: 'Building Scalable React Native Apps: Best Practices',
      content: 'React Native has become a powerful tool for building cross-platform mobile applications. In this comprehensive guide, we\'ll explore the best practices for creating scalable, maintainable apps...',
      excerpt: 'Learn essential techniques for creating robust React Native applications.',
      author: {
        id: '3',
        name: 'Mike Chen',
        email: 'mike@example.com',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        followersCount: 1850,
        followingCount: 320,
        postsCount: 67,
      },
      createdAt: '2024-01-14T15:45:00Z',
      updatedAt: '2024-01-14T15:45:00Z',
      likesCount: 89,
      commentsCount: 15,
      isLiked: true,
      tags: ['React Native', 'Mobile Development', 'JavaScript'],
      imageUrl: 'https://images.pexels.com/photos/177598/pexels-photo-177598.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=2',
      readTime: 12,
    },
    {
      id: '3',
      title: 'Design Systems: Creating Consistency in Digital Products',
      content: 'Design systems have revolutionized how we approach product design and development. By establishing clear guidelines, components, and patterns, teams can create more cohesive user experiences...',
      excerpt: 'Understanding the importance and implementation of design systems.',
      author: {
        id: '4',
        name: 'Emma Rodriguez',
        email: 'emma@example.com',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        followersCount: 3200,
        followingCount: 145,
        postsCount: 92,
      },
      createdAt: '2024-01-13T09:20:00Z',
      updatedAt: '2024-01-13T09:20:00Z',
      likesCount: 156,
      commentsCount: 31,
      isLiked: false,
      tags: ['Design', 'UX/UI', 'Design Systems'],
      imageUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&dpr=2',
      readTime: 10,
    },
  ];

  useEffect(() => {
    refreshPosts();
  }, []);

  useEffect(() => {
    if (user) {
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.author.id === user.id) {
            return {
              ...post,
              author: {
                ...post.author,
                name: user.name,
                avatar: user.avatar,
              },
            };
          }
          return post;
        })
      );
    }
  }, [user]);

  const refreshPosts = async () => {
    setLoading(true);
    try {
      const postsCollection = collection(db, 'posts');
      const postsSnapshot = await getDocs(postsCollection);
      const fetchedPosts = await Promise.all(
        postsSnapshot.docs.map(async (postDoc) => {
          const postData = postDoc.data();
          const authorRef = doc(db, 'users', postData.author.id);
          const authorSnapshot = await getDoc(authorRef);
          const authorData = authorSnapshot.exists() ? authorSnapshot.data() : postData.author;

          return {
            id: postDoc.id,
            title: postData.title,
            content: postData.content,
            excerpt: postData.excerpt,
            author: {
              ...postData.author,
              name: authorData.name || postData.author.name,
              avatar: authorData.avatar || postData.author.avatar,
            },
            createdAt: postData.createdAt,
            updatedAt: postData.updatedAt,
            likesCount: postData.likesCount,
            commentsCount: postData.commentsCount,
            isLiked: postData.isLiked,
            tags: postData.tags,
            readTime: postData.readTime,
            imageUrl: postData.imageUrl,
            likedBy: postData.likedBy || [],
          };
        })
      );

      const commentsMap: Record<string, Comment[]> = {};
      postsSnapshot.docs.forEach(postDoc => {
        const postData = postDoc.data();
        commentsMap[postDoc.id] = postData.comments || [];
      });

      setPosts(fetchedPosts);
      setComments(commentsMap);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleLike = async (postId: string) => {
    const userId = auth.currentUser?.uid; // Get actual user ID from AuthContext
    if (!userId) {
      console.error('User is not authenticated.');
      return;
    }

    const postRef = doc(db, 'posts', postId);

    try {
      const postSnapshot = await getDoc(postRef);
      if (postSnapshot.exists()) {
        const postData = postSnapshot.data();
        const likedBy = postData.likedBy || [];

        const updatedLikedBy = likedBy.includes(userId)
          ? likedBy.filter((id: string) => id !== userId)
          : [...likedBy, userId];

        await updateDoc(postRef, { likedBy: updatedLikedBy, likesCount: updatedLikedBy.length });

        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                isLiked: updatedLikedBy.includes(userId),
                likesCount: updatedLikedBy.length
              }
            : post
        ));
      } else {
        console.error('Post does not exist.');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const addComment = async (postId: string, content: string) => {
    const userId = auth.currentUser?.uid; // Get actual user ID from AuthContext
    if (!auth.currentUser || !userId) {
      console.error('User is not authenticated.');
      return;
    }

    const postRef = doc(db, 'posts', postId);
    const newComment: Comment = {
      id: Date.now().toString(),
      content,
      author: {
        id: userId,
        name: auth.currentUser.displayName || 'Anonymous',
        email: auth.currentUser.email || '',
        avatar: auth.currentUser.photoURL || '',
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
      },
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLiked: false,
    };

    try {
      await updateDoc(postRef, {
        comments: arrayUnion(newComment),
        commentsCount: increment(1),
      });

      setComments(prev => {
        const updatedComments = prev[postId] ? [...prev[postId], newComment] : [newComment];
        return {
          ...prev,
          [postId]: updatedComments,
        };
      });

      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, commentsCount: post.commentsCount + 1 }
          : post
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const getComments = (postId: string): Comment[] => {
    return comments[postId] || [];
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