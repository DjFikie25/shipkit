import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/auth';
import { ChatWindow } from '@/components/chat/ChatWindow';

export const metadata = { title: 'AI Chat' };

export default async function ChatPage() {
  const user = await getServerUser();
  if (!user) redirect('/signin?next=/chat');

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex-none border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Dashboard</a>
          <span className="font-semibold text-gray-900">AI Chat</span>
        </div>
      </header>
      <ChatWindow userId={user.id} />
    </div>
  );
}
