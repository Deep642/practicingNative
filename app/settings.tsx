import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeMode, ThemeMode } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { updateProfile } from 'firebase/auth';
import { auth, db, storage } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const { width } = Dimensions.get('window');

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { mode, setMode } = useThemeMode();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePic, setProfilePic] = useState(user?.avatar || '');

  const handleSave = () => {
    Alert.alert('Settings Saved', 'Your changes have been saved successfully.');
  };

  const handleThemeChange = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  const handleProfilePicChange = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Reverted to the original API
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && user && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      if (uri) {
        setProfilePic(uri);

        const storageRef = ref(storage, `avatars/${user.id}`);
        const response = await fetch(uri);
        const blob = await response.blob();
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        await updateDoc(doc(db, 'users', user.id), { avatar: downloadURL });
        await updateProfile(auth.currentUser!, { photoURL: downloadURL });

        Alert.alert('Profile Picture Updated', 'Your profile picture has been updated successfully.');
      } else {
        Alert.alert('Error', 'Invalid image URI.');
      }
    } else {
      Alert.alert('Error', 'No image selected or user is not authenticated.');
    }
  };

  const handleProfileUpdate = async () => {
    try {
      if (auth.currentUser && user) {
        const userRef = doc(db, 'users', user.id);
        const updates = {
          name,
          email,
          avatar: profilePic,
        };

        await updateDoc(userRef, updates);
        Alert.alert('Profile Updated', 'Your profile details have been updated successfully.');
      } else {
        Alert.alert('Error', 'User is not authenticated or user data is unavailable.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      Alert.alert('Error', message);
    }
  };

  const handlePasswordChange = () => {
    // Password change logic here
    Alert.alert('Password Change', 'Password change functionality is not implemented yet.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Profile Picture</Text>
        <TouchableOpacity onPress={handleProfilePicChange}>
          <Image source={{ uri: profilePic }} style={styles.profilePic} />
        </TouchableOpacity>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Theme</Text>
        <View style={styles.themeButtons}>
          <TouchableOpacity
            style={[styles.themeButton, mode === 'light' && styles.activeButton]}
            onPress={() => handleThemeChange('light')}
          >
            <Text style={[styles.buttonText, { color: '#000000' }]}>Light</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.themeButton, mode === 'dark' && styles.activeButton]}
            onPress={() => handleThemeChange('dark')}
          >
            <Text style={[styles.buttonText, { color: '#000000' }]}>Dark</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.saveButton, { marginBottom: 16 }]} onPress={handleProfileUpdate}>
          <Text style={[styles.saveButtonText, { color: '#000000' }]}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.saveButton, { marginBottom: 16 }]} onPress={() => router.push('/auth/update-password')}>
          <Text style={[styles.saveButtonText, { color: '#000000' }]}>Update Password</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: width > 768 ? 24 : 16,
  },
  header: {
    fontFamily: 'Inter-Bold',
    fontSize: width > 768 ? 28 : 24,
    color: '#111827',
    marginBottom: width > 768 ? 20 : 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: width > 768 ? 12 : 8,
    padding: width > 768 ? 16 : 12,
    fontSize: width > 768 ? 18 : 16,
    marginBottom: width > 768 ? 20 : 16,
  },
  themeButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  themeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  activeButton: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  buttonText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  backButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#374151',
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  // Dark mode styles should be handled separately, not as a nested object in StyleSheet.
});
