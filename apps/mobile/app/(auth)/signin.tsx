import { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { authClient } from '@/lib/auth-client';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    setError('');
    const { error: err } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (err) { setError(err.message ?? 'Sign in failed'); return; }
    router.replace('/(app)');
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center px-6">
        <Text className="mb-2 text-3xl font-bold text-gray-900">Welcome back</Text>
        <Text className="mb-8 text-base text-gray-500">Sign in to your account</Text>

        {!!error && (
          <View className="mb-4 rounded-xl bg-red-50 p-3">
            <Text className="text-sm text-red-600">{error}</Text>
          </View>
        )}

        <Text className="mb-1 text-sm font-medium text-gray-700">Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          className="mb-4 rounded-xl border border-gray-200 px-4 py-3.5 text-base text-gray-900"
          placeholder="you@example.com"
        />

        <Text className="mb-1 text-sm font-medium text-gray-700">Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          className="mb-6 rounded-xl border border-gray-200 px-4 py-3.5 text-base text-gray-900"
          placeholder="••••••••"
        />

        <Pressable
          onPress={handleSignIn}
          disabled={loading}
          className="rounded-xl bg-blue-600 py-4 active:bg-blue-700"
        >
          <Text className="text-center text-base font-semibold text-white">
            {loading ? 'Signing in…' : 'Sign in'}
          </Text>
        </Pressable>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-sm text-gray-500">Don't have an account? </Text>
          <Link href="/(auth)/signup" className="text-sm font-medium text-blue-600">
            Sign up
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
