import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { updatePassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase'; // Import Firestore database
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

export default function UpdatePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Improved error handling for invalid credentials
  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New password and confirm password do not match.');
      return;
    }

    try {
      if (auth.currentUser) {
        // Reauthenticate the user
        const credential = EmailAuthProvider.credential(auth.currentUser.email!, oldPassword);
        await reauthenticateWithCredential(auth.currentUser, credential);

        // Update password in Firebase Authentication
        await updatePassword(auth.currentUser, newPassword);

        // Update password in Firestore (if applicable)
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { password: newPassword });

        Alert.alert('Success', 'Password updated successfully.');
      } else {
        Alert.alert('Error', 'User is not authenticated.');
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('auth/wrong-password')) {
        Alert.alert('Error', 'The old password is incorrect. Please try again.');
      } else {
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        Alert.alert('Error', message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Update Password</Text>

      <Text style={styles.label}>Old Password</Text>
      <TextInput
        style={styles.input}
        value={oldPassword}
        onChangeText={setOldPassword}
        secureTextEntry
      />

      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePassword}>
        <Text style={styles.updateButtonText}>Update Password</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  header: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#111827',
    marginBottom: 16,
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
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 16,
  },
  updateButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
