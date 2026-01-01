interface OnlineStatusProps {
  isOnline: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function OnlineStatus({ isOnline, size = 'md' }: OnlineStatusProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`absolute bottom-0 right-0 ${sizeClasses[size]} ${
        isOnline ? 'bg-green-500' : 'bg-gray-400'
      } border-2 border-white rounded-full`}
    ></span>
  );
}