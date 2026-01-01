import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Messaging
          </h1>
          <p className="text-gray-600">
            Connect and chat with people in real-time
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="block w-full bg-gray-200 text-gray-800 text-center py-3 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Register
          </Link>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Real-time messaging with WebSocket</p>
        </div>
      </div>
    </div>
  );
}