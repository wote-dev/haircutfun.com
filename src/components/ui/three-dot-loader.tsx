interface ThreeDotLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ThreeDotLoader({ className = '', size = 'md' }: ThreeDotLoaderProps) {
  const sizeClasses = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2', 
    lg: 'w-3 h-3'
  };

  const dotSize = sizeClasses[size];

  return (
    <div className={`flex items-center justify-center space-x-1 ${className}`}>
      <div 
        className={`${dotSize} bg-primary rounded-full animate-pulse`}
        style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
      />
      <div 
        className={`${dotSize} bg-primary rounded-full animate-pulse`}
        style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
      />
      <div 
        className={`${dotSize} bg-primary rounded-full animate-pulse`}
        style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
      />
    </div>
  );
}