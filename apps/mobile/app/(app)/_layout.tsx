import { Tabs } from 'expo-router';
import { useSession } from '@/lib/auth-client';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function AppLayout() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0070f3" />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/signin" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0070f3',
        tabBarStyle: { borderTopColor: '#e5e7eb' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarLabel: 'Home' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat', tabBarLabel: 'Chat' }} />
    </Tabs>
  );
}
