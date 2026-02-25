import { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = process.env['EXPO_PUBLIC_API_URL'] ?? 'http://localhost:3000';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          agentId: 'assistantAgent',
        }),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Chat request failed');

      // Read streaming text
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      const assistantId = `ast_${Date.now()}`;
      setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          // Parse AI SDK data stream format
          for (const line of chunk.split('\n')) {
            if (line.startsWith('0:')) {
              try {
                const textChunk = JSON.parse(line.slice(2)) as string;
                assistantText += textChunk;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: assistantText } : m,
                  ),
                );
              } catch { /* skip malformed chunk */ }
            }
          }
        }
      }
    } catch {
      const errMsg: Message = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [input, isLoading, messages]);

  const renderItem = useCallback(({ item }: { item: Message }) => (
    <View className={`mb-3 flex-row ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <View
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          item.role === 'user' ? 'bg-blue-600' : 'border border-gray-200 bg-white'
        }`}
      >
        <Text className={item.role === 'user' ? 'text-white' : 'text-gray-800'}>
          {item.content}
        </Text>
      </View>
    </View>
  ), []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 py-4"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-4xl">💬</Text>
              <Text className="mt-3 text-base font-semibold text-gray-900">AI Chat</Text>
              <Text className="mt-1 text-sm text-gray-500">Ask me anything to get started</Text>
            </View>
          }
          ListFooterComponent={
            isLoading ? (
              <View className="mb-3 flex-row justify-start px-4">
                <View className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                  <ActivityIndicator size="small" color="#9ca3af" />
                </View>
              </View>
            ) : null
          }
        />

        {/* Input bar */}
        <View className="border-t border-gray-200 bg-white px-4 py-3">
          <View className="flex-row gap-2">
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type a message…"
              multiline
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900"
              returnKeyType="send"
              onSubmitEditing={sendMessage}
              blurOnSubmit={false}
            />
            <Pressable
              onPress={sendMessage}
              disabled={isLoading || !input.trim()}
              className="rounded-xl bg-blue-600 px-4 py-3 disabled:opacity-40"
            >
              <Text className="font-semibold text-white">↑</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
