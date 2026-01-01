export default function TypingIndicator({ users }: { users: string[] }) {
  return (
    <div className="px-6 py-2 text-sm text-gray-500 italic">
      {users.length === 1
        ? `${users[0]} is typing...`
        : `${users.join(', ')} are typing...`}
    </div>
  );
}