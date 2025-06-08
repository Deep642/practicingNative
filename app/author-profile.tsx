import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs } from 'firebase/firestore';

export default function AuthorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [author, setAuthor] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followersData, setFollowersData] = useState<any[]>([]);
  const [followingData, setFollowingData] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetchAuthor = async () => {
      setLoading(true);
      const docSnap = await getDoc(doc(db, 'users', id));
      if (docSnap.exists()) {
        setAuthor({ id, ...docSnap.data() });
        setIsFollowing(docSnap.data().followers?.includes(user?.id));
      }
      setLoading(false);
    };
    fetchAuthor();
  }, [id, user?.id]);

  useEffect(() => {
    const fetchUsers = async (ids: string[], setter: (users: any[]) => void) => {
      if (!ids || ids.length === 0) return setter([]);
      const usersCol = collection(db, 'users');
      const allUsersSnap = await getDocs(usersCol);
      const users = allUsersSnap.docs
        .filter(doc => ids.includes(doc.id))
        .map(doc => ({ id: doc.id, ...doc.data() }));
      setter(users);
    };
    if (author?.followers) fetchUsers(author.followers, setFollowersData);
    if (author?.following) fetchUsers(author.following, setFollowingData);
  }, [author]);

  const handleFollow = async () => {
    if (!user) return;
    const authorRef = doc(db, 'users', id);
    const userRef = doc(db, 'users', user.id);
    if (isFollowing) {
      await updateDoc(authorRef, { followers: arrayRemove(user.id), followersCount: (author.followersCount || 1) - 1 });
      await updateDoc(userRef, { following: arrayRemove(id), followingCount: (user.followingCount || 1) - 1 });
      setIsFollowing(false);
    } else {
      await updateDoc(authorRef, { followers: arrayUnion(user.id), followersCount: (author.followersCount || 0) + 1 });
      await updateDoc(userRef, { following: arrayUnion(id), followingCount: (user.followingCount || 0) + 1 });
      setIsFollowing(true);
    }
  };

  if (loading) return <SafeAreaView style={styles.container}><Text>Loading...</Text></SafeAreaView>;
  if (!author) return <SafeAreaView style={styles.container}><Text>Author not found.</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Image source={{ uri: author.avatar || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2' }} style={styles.profileImage} />
        <Text style={styles.userName}>{author.name}</Text>
        <Text style={styles.userEmail}>{author.email}</Text>
        {author.bio && <Text style={styles.userBio}>{author.bio}</Text>}
        <TouchableOpacity style={[styles.followButton, isFollowing && styles.followingButton]} onPress={handleFollow}>
          <Text style={styles.followButtonText}>{isFollowing ? 'Following' : 'Follow'}</Text>
        </TouchableOpacity>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statCount}>{author.followersCount || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statCount}>{author.followingCount || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
        {/* Followers List */}
        {followersData.length > 0 && (
          <View style={styles.listBox}>
            <Text style={styles.listTitle}>Followers:</Text>
            {followersData.map((u) => (
              <Text key={u.id} style={styles.listItem}>{u.name || u.id}</Text>
            ))}
          </View>
        )}
        {/* Following List */}
        {followingData.length > 0 && (
          <View style={styles.listBox}>
            <Text style={styles.listTitle}>Following:</Text>
            {followingData.map((u) => (
              <Text key={u.id} style={styles.listItem}>{u.name || u.id}</Text>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 40,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  userName: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  userBio: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  followButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  followingButton: {
    backgroundColor: '#6B7280',
  },
  followButtonText: {
    color: '#fff',
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 16,
    marginBottom: 8,
  },
  statBox: {
    alignItems: 'center',
  },
  statCount: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#111827',
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  listBox: {
    marginTop: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    width: 260,
  },
  listTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#3B82F6',
    marginBottom: 6,
  },
  listItem: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  backButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#3B82F6',
  },
});
