/**
 * Root entry — redirects to (auth) or (app) based on session.
 */
import { Redirect } from 'expo-router';
import { useSession } from '@/lib/auth-client';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0070f3" />
      </View>
    );
  }

  return session ? <Redirect href="/(app)" /> : <Redirect href="/(auth)/signin" />;
}
