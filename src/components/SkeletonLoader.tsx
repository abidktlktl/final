import React from 'react';

interface SkeletonLoaderProps {
  type?: 'card' | 'reel' | 'stat' | 'text' | 'button';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'card', 
  count = 1,
  className = ''
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'reel':
        return (
          <div className="animate-pulse">
            <div className="aspect-[9/16] bg-gray-200 rounded-xl skeleton"></div>
            <div className="mt-2 space-y-2">
              <div className="h-3 bg-gray-200 rounded skeleton w-3/4"></div>
              <div className="h-2 bg-gray-200 rounded skeleton w-1/2"></div>
            </div>
          </div>
        );
      
      case 'stat':
        return (
          <div className="animate-pulse p-6 bg-white rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded skeleton w-20"></div>
                <div className="h-8 bg-gray-200 rounded skeleton w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-2xl skeleton"></div>
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded skeleton"></div>
            <div className="h-4 bg-gray-200 rounded skeleton w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded skeleton w-4/6"></div>
          </div>
        );
      
      case 'button':
        return (
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded-lg skeleton w-full"></div>
          </div>
        );
      
      case 'card':
      default:
        return (
          <div className="animate-pulse p-6 bg-white rounded-xl shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg skeleton"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded skeleton w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded skeleton w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded skeleton"></div>
              <div className="h-3 bg-gray-200 rounded skeleton w-5/6"></div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

// Loading dots component
export const LoadingDots: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-2 h-2 bg-purple-600 rounded-full loading-dot"></div>
      <div className="w-2 h-2 bg-purple-600 rounded-full loading-dot"></div>
      <div className="w-2 h-2 bg-purple-600 rounded-full loading-dot"></div>
    </div>
  );
};

// Empty state component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4 pulse-animation">
          {icon}
        </div>
      )}
      <h3 className="font-semibold text-xl mb-2 text-gray-900 slide-up">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto fade-in">{description}</p>
      {action && <div className="fade-in">{action}</div>}
    </div>
  );
};
