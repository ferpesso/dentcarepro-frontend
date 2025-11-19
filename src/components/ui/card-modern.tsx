import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardModernProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient';
  hover?: boolean;
  onClick?: () => void;
}

export function CardModern({ 
  children, 
  className = '', 
  variant = 'default',
  hover = true,
  onClick 
}: CardModernProps) {
  const baseClasses = 'rounded-xl p-6 transition-all-smooth';
  
  const variantClasses = {
    default: 'card-modern',
    glass: 'card-glass',
    gradient: 'gradient-blue text-white shadow-glow',
  };
  
  const hoverClass = hover ? 'hover-lift cursor-pointer' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${hoverClass}
        ${clickableClass}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange';
  onClick?: () => void;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'blue',
  onClick 
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  };

  return (
    <CardModern onClick={onClick} className="animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span className={`text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                vs mês anterior
              </span>
            </div>
          )}
        </div>

        <div className={`
          p-3 rounded-lg ${colorClasses[color]}
          transition-all-smooth hover-scale
        `}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardModern>
  );
}

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  badge?: string;
}

export function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  onClick,
  badge 
}: FeatureCardProps) {
  return (
    <CardModern onClick={onClick} className="animate-fade-in-up group">
      <div className="relative">
        {badge && (
          <span className="absolute -top-2 -right-2 badge-modern badge-info badge-pulse">
            {badge}
          </span>
        )}
        
        <div className="flex items-center gap-4">
          <div className="
            p-3 rounded-lg bg-blue-50 text-blue-600
            dark:bg-blue-900/20 dark:text-blue-400
            group-hover:scale-110 transition-transform-smooth
          ">
            <Icon className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          </div>
        </div>
      </div>
    </CardModern>
  );
}

interface ProgressCardProps {
  title: string;
  current: number;
  total: number;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export function ProgressCard({ 
  title, 
  current, 
  total, 
  icon: Icon,
  color = 'blue' 
}: ProgressCardProps) {
  const percentage = Math.round((current / total) * 100);
  
  const gradientClasses = {
    blue: 'gradient-blue',
    green: 'gradient-green',
    purple: 'gradient-purple',
    orange: 'gradient-orange',
  };

  return (
    <CardModern className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {current} de {total}
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {percentage}%
          </span>
        </div>

        <div className="progress-modern">
          <div 
            className={`progress-bar ${gradientClasses[color]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </CardModern>
  );
}
