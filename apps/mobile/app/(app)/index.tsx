import { View, Text, Pressable, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession, authClient } from '@/lib/auth-client';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { data: session } = useSession();
  const user = session?.user;
  const displayName = user?.name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there';

  async function handleSignOut() {
    await authClient.signOut();
    router.replace('/(auth)/signin');
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerClassName="px-5 py-8">
        {/* Header */}
        <View className="mb-8 flex-row items-center justify-between">
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              Hello, {displayName}!
            </Text>
            <Text className="mt-0.5 text-sm text-gray-500">{user?.email}</Text>
          </View>
          <Pressable
            onPress={handleSignOut}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2"
          >
            <Text className="text-sm font-medium text-gray-700">Sign out</Text>
          </Pressable>
        </View>

        {/* Quick actions */}
        <View className="gap-4">
          <Link href="/(app)/chat" asChild>
            <Pressable className="rounded-2xl bg-blue-600 p-5">
              <Text className="text-2xl">💬</Text>
              <Text className="mt-2 text-base font-semibold text-white">AI Chat</Text>
              <Text className="mt-0.5 text-sm text-blue-200">Ask your AI assistant anything</Text>
            </Pressable>
          </Link>

          <View className="rounded-2xl border border-dashed border-gray-200 bg-white p-5">
            <Text className="text-2xl opacity-40">📦</Text>
            <Text className="mt-2 text-base font-semibold text-gray-400">Your feature</Text>
            <Text className="mt-0.5 text-sm text-gray-400">Add your app content here</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
