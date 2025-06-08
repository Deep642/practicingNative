import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Image as ImageIcon, Tag, Send } from 'lucide-react-native';
import { useBlog } from '@/contexts/BlogContext';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';

export default function CreateScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { refreshPosts } = useBlog();

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing Information', 'Please provide both a title and content for your post.');
      return;
    }
    if (!user) {
      Alert.alert('Not Authenticated', 'You must be logged in to create a post.');
      return;
    }
    setIsSubmitting(true);
    try {
      // Compose post object
      const now = new Date();
      const post: any = {
        title: title.trim(),
        content: content.trim(),
        excerpt: content.trim().slice(0, 120) + (content.trim().length > 120 ? '...' : ''),
        author: user,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        readTime: Math.max(1, Math.round(content.trim().split(/\s+/).length / 200)),
        likedBy: [],
      };
      if (imageUrl.trim()) {
        post.imageUrl = imageUrl.trim();
      }
      // Add to Firestore
      await addDoc(collection(db, 'posts'), post);
      // Increment user's postsCount
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { postsCount: increment(1) });
      setTitle('');
      setContent('');
      setTags('');
      setImageUrl('');
      refreshPosts();
      Alert.alert('Post Published!', 'Your blog post has been published successfully.');
    } catch (err: any) {
      const errorMsg = err?.message || JSON.stringify(err);
      Alert.alert('Error', `Failed to publish post. ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Ensured compatibility with the current API
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUrl(result.assets[0].uri);
    } else {
      console.error('No image selected or invalid URI.');
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Ensured compatibility with the current API
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUrl(result.assets[0].uri);
    } else {
      console.error('No photo taken or invalid URI.');
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const estimatedReadTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create New Post</Text>
          <TouchableOpacity
            style={[styles.publishButton, (!title.trim() || !content.trim()) && styles.disabledButton]}
            onPress={handlePublish}
            disabled={isSubmitting || !title.trim() || !content.trim()}
          >
            {isSubmitting ? (
              <LoadingSpinner size={16} color="#FFFFFF" />
            ) : (
              <>
                <Send size={16} color="#FFFFFF" />
                <Text style={styles.publishButtonText}>Publish</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.titleInput}
                placeholder="Enter your post title..."
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={setTitle}
                multiline
                autoCorrect
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <ImageIcon size={16} color="#6B7280" />
                <Text style={styles.label}>Featured Image</Text>
                <TouchableOpacity onPress={pickImage} style={{ marginLeft: 12 }}>
                  <Text style={{ color: '#3B82F6', fontFamily: 'Inter-Medium' }}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={takePhoto} style={{ marginLeft: 12 }}>
                  <Text style={{ color: '#3B82F6', fontFamily: 'Inter-Medium' }}>Camera</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="https://example.com/image.jpg"
                placeholderTextColor="#9CA3AF"
                value={imageUrl}
                onChangeText={setImageUrl}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={{ width: '100%', height: 180, borderRadius: 12, marginTop: 8 }} />
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Content</Text>
              <TextInput
                style={styles.contentInput}
                placeholder="Write your story..."
                placeholderTextColor="#9CA3AF"
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
                autoCorrect
              />
              <View style={styles.contentStats}>
                <Text style={styles.statsText}>{wordCount} words</Text>
                <Text style={styles.statsText}>•</Text>
                <Text style={styles.statsText}>{estimatedReadTime} min read</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Tag size={16} color="#6B7280" />
                <Text style={styles.label}>Tags (comma separated)</Text>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="React, JavaScript, Web Development"
                placeholderTextColor="#9CA3AF"
                value={tags}
                onChangeText={setTags}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#111827',
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  publishButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 16,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#374151',
  },
  titleInput: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 24,
    color: '#111827',
    lineHeight: 32,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  textInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  contentInput: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
    minHeight: 300,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  contentStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  statsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
});