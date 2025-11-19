import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({ 
  className = '', 
  variant = 'text',
  width,
  height,
  count = 1
}: SkeletonProps) {
  const baseClasses = 'skeleton animate-pulse';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card-modern p-6 animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" />
          <Skeleton width="40%" />
        </div>
        <Skeleton variant="circular" width={48} height={48} />
      </div>
      <Skeleton width="80%" />
      <Skeleton width="90%" className="mt-2" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-fade-in">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <Skeleton width={40} />
        <Skeleton width="25%" />
        <Skeleton width="20%" />
        <Skeleton width="15%" />
        <Skeleton width="20%" />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton width="25%" />
          <Skeleton width="20%" />
          <Skeleton width="15%" />
          <Skeleton width="20%" />
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="card-modern p-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton variant="circular" width={80} height={80} />
        <div className="flex-1 space-y-2">
          <Skeleton width="40%" height={24} />
          <Skeleton width="60%" />
          <Skeleton width="50%" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton width="30%" />
          <Skeleton width="100%" height={40} variant="rectangular" />
        </div>
        <div className="space-y-2">
          <Skeleton width="30%" />
          <Skeleton width="100%" height={40} variant="rectangular" />
        </div>
        <div className="space-y-2">
          <Skeleton width="30%" />
          <Skeleton width="100%" height={80} variant="rectangular" />
        </div>
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton width="40%" height={32} />
        <Skeleton width="60%" />
      </div>

      {/* Stats */}
      <StatsSkeleton />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-modern p-6">
          <Skeleton width="40%" height={24} className="mb-4" />
          <Skeleton variant="rectangular" height={300} />
        </div>
        <div className="card-modern p-6">
          <Skeleton width="40%" height={24} className="mb-4" />
          <Skeleton variant="rectangular" height={300} />
        </div>
      </div>

      {/* Table */}
      <div className="card-modern p-6">
        <Skeleton width="30%" height={24} className="mb-4" />
        <TableSkeleton />
      </div>
    </div>
  );
}
