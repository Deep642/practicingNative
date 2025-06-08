import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Heart } from 'lucide-react-native';
import { Comment } from '@/types/blog';

interface CommentItemProps {
  comment: Comment;
}

export function CommentItem({ comment }: CommentItemProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: comment.author.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2' }}
        style={styles.avatar}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.authorName}>{comment.author.name}</Text>
          <Text style={styles.date}>{formatDate(comment.createdAt)}</Text>
        </View>
        
        <Text style={styles.commentText}>{comment.content}</Text>
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.likeButton}>
            <Heart 
              size={14} 
              color={comment.isLiked ? '#EF4444' : '#6B7280'} 
              fill={comment.isLiked ? '#EF4444' : 'transparent'}
            />
            <Text style={[styles.likeCount, comment.isLiked && styles.liked]}>
              {comment.likesCount}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity>
            <Text style={styles.replyButton}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  authorName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#111827',
    marginRight: 8,
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  commentText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 2,
  },
  likeCount: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  liked: {
    color: '#EF4444',
  },
  replyButton: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#3B82F6',
  },
});