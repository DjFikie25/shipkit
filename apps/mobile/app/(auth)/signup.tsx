import { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, router } from 'expo-router';
import { authClient } from '@/lib/auth-client';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await authClient.signUp.email({ name, email, password });
    setLoading(false);
    if (err) { setError(err.message ?? 'Sign up failed'); return; }
    router.replace('/(app)');
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center px-6">
        <Text className="mb-2 text-3xl font-bold text-gray-900">Create account</Text>
        <Text className="mb-8 text-base text-gray-500">Free to get started</Text>

        {!!error && (
          <View className="mb-4 rounded-xl bg-red-50 p-3">
            <Text className="text-sm text-red-600">{error}</Text>
          </View>
        )}

        {[
          { label: 'Full name', value: name, set: setName, type: 'default', complete: 'name', placeholder: 'Jane Smith' },
          { label: 'Email', value: email, set: setEmail, type: 'email-address', complete: 'email', placeholder: 'you@example.com' },
          { label: 'Password', value: password, set: setPassword, type: 'default', complete: 'new-password', placeholder: 'At least 8 characters', secure: true },
        ].map((field) => (
          <View key={field.label} className="mb-4">
            <Text className="mb-1 text-sm font-medium text-gray-700">{field.label}</Text>
            <TextInput
              value={field.value}
              onChangeText={field.set}
              keyboardType={field.type as 'default' | 'email-address'}
              autoCapitalize="none"
              autoComplete={field.complete as 'name' | 'email' | 'new-password'}
              secureTextEntry={field.secure}
              placeholder={field.placeholder}
              className="rounded-xl border border-gray-200 px-4 py-3.5 text-base text-gray-900"
            />
          </View>
        ))}

        <Pressable
          onPress={handleSignUp}
          disabled={loading}
          className="mt-2 rounded-xl bg-blue-600 py-4 active:bg-blue-700"
        >
          <Text className="text-center text-base font-semibold text-white">
            {loading ? 'Creating account…' : 'Create account'}
          </Text>
        </Pressable>

        <View className="mt-6 flex-row justify-center">
          <Text className="text-sm text-gray-500">{"Already have an account? "}</Text>
          <Link href="/(auth)/signin" className="text-sm font-medium text-blue-600">Sign in</Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
