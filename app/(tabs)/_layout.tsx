import { Tabs } from 'expo-router';
import { Chrome as Home, Search, User, CirclePlus as PlusCircle } from 'lucide-react-native';
import { BlogProvider } from '@/contexts/BlogContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function TabLayout() {
  return (
    <ThemeProvider>
      <BlogProvider>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#3B82F6',
            tabBarInactiveTintColor: '#6B7280',
            tabBarStyle: {
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#E5E7EB',
              paddingBottom: 8,
              paddingTop: 8,
              height: 80,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontFamily: 'Inter-Medium',
              marginTop: 4,
            },
          }}>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ size, color }) => (
                <Home size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="search"
            options={{
              title: 'Search',
              tabBarIcon: ({ size, color }) => (
                <Search size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="create"
            options={{
              title: 'Create',
              tabBarIcon: ({ size, color }) => (
                <PlusCircle size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ size, color }) => (
                <User size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </BlogProvider>
    </ThemeProvider>
  );
}