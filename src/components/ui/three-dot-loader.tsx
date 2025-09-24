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
      <style jsx>{`
        @keyframes dot-flashing {
          0% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.2;
          }
        }
        .dot-flashing {
          animation: dot-flashing 1.4s infinite linear;
        }
      `}</style>
      <div 
        className={`${dotSize} bg-primary rounded-full dot-flashing`}
        style={{ animationDelay: '0s' }}
      />
      <div 
        className={`${dotSize} bg-primary rounded-full dot-flashing`}
        style={{ animationDelay: '0.2s' }}
      />
      <div 
        className={`${dotSize} bg-primary rounded-full dot-flashing`}
        style={{ animationDelay: '0.4s' }}
      />
    </div>
  );
}