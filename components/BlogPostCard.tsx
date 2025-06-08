import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Heart, MessageCircle, Clock, User } from 'lucide-react-native';
import { BlogPost } from '@/types/blog';
import { useBlog } from '@/contexts/BlogContext';
import { router } from 'expo-router';

interface BlogPostCardProps {
  post: BlogPost;
}

const { width } = Dimensions.get('window');

export function BlogPostCard({ post }: BlogPostCardProps) {
  const { toggleLike } = useBlog();

  const handleLike = () => {
    toggleLike(post.id);
  };

  const handlePress = () => {
    router.push(`/post/${post.id}`);
  };

  const handleAuthorPress = () => {
    router.push(`/author-profile?id=${post.author.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.95}>
      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.image} />
      )}
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.authorSection}>
            <TouchableOpacity onPress={handleAuthorPress} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={{ uri: post.author.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' }}
                style={styles.avatar}
              />
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{post.author.name}</Text>
                <View style={styles.metaInfo}>
                  <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
                  <Text style={styles.separator}>•</Text>
                  <View style={styles.readTime}>
                    <Clock size={12} color="#6B7280" />
                    <Text style={styles.readTimeText}>{post.readTime} min read</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.excerpt}>{post.excerpt}</Text>

        <View style={styles.tags}>
          {post.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.actionButton, post.isLiked && styles.liked]} 
              onPress={handleLike}
            >
              <Heart 
                size={18} 
                color={post.isLiked ? '#EF4444' : '#6B7280'} 
                fill={post.isLiked ? '#EF4444' : 'transparent'}
              />
              <Text style={[styles.actionText, post.isLiked && styles.likedText]}>
                {post.likesCount}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handlePress}>
              <MessageCircle size={18} color="#6B7280" />
              <Text style={styles.actionText}>{post.commentsCount}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 12,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#111827',
    marginBottom: 2,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  separator: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
    marginHorizontal: 6,
  },
  readTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readTimeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#111827',
    lineHeight: 24,
    marginBottom: 8,
  },
  excerpt: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#4B5563',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  liked: {
    backgroundColor: '#FEF2F2',
  },
  actionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
  },
  likedText: {
    color: '#EF4444',
  },
});