import React from 'react';
import { LucideIcon } from 'lucide-react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeModernProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: LucideIcon;
  pulse?: boolean;
  className?: string;
  onClick?: () => void;
}

const variantClasses = {
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function BadgeModern({ 
  children, 
  variant = 'default',
  size = 'md',
  icon: Icon,
  pulse = false,
  className = '',
  onClick
}: BadgeModernProps) {
  return (
    <span
      className={`
        badge-modern
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${pulse ? 'badge-pulse' : ''}
        ${onClick ? 'cursor-pointer hover-scale' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {Icon && <Icon className="w-3 h-3 mr-1 inline-block" />}
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';
  showIcon?: boolean;
  pulse?: boolean;
}

export function StatusBadge({ status, showIcon = true, pulse = false }: StatusBadgeProps) {
  const statusConfig = {
    active: {
      label: 'Ativo',
      variant: 'success' as BadgeVariant,
      icon: '●',
    },
    inactive: {
      label: 'Inativo',
      variant: 'default' as BadgeVariant,
      icon: '●',
    },
    pending: {
      label: 'Pendente',
      variant: 'warning' as BadgeVariant,
      icon: '●',
    },
    completed: {
      label: 'Concluído',
      variant: 'success' as BadgeVariant,
      icon: '✓',
    },
    cancelled: {
      label: 'Cancelado',
      variant: 'error' as BadgeVariant,
      icon: '✕',
    },
  };

  const config = statusConfig[status];

  return (
    <BadgeModern variant={config.variant} pulse={pulse}>
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {config.label}
    </BadgeModern>
  );
}

interface CountBadgeProps {
  count: number;
  max?: number;
  variant?: BadgeVariant;
  pulse?: boolean;
}

export function CountBadge({ count, max = 99, variant = 'error', pulse = false }: CountBadgeProps) {
  const displayCount = count > max ? `${max}+` : count;

  return (
    <BadgeModern 
      variant={variant} 
      size="sm" 
      pulse={pulse}
      className="min-w-[20px] h-5 flex items-center justify-center rounded-full"
    >
      {displayCount}
    </BadgeModern>
  );
}

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const priorityConfig = {
    low: {
      label: 'Baixa',
      variant: 'info' as BadgeVariant,
    },
    medium: {
      label: 'Média',
      variant: 'warning' as BadgeVariant,
    },
    high: {
      label: 'Alta',
      variant: 'error' as BadgeVariant,
    },
    urgent: {
      label: 'Urgente',
      variant: 'error' as BadgeVariant,
      pulse: true,
    },
  };

  const config = priorityConfig[priority];

  return (
    <BadgeModern 
      variant={config.variant} 
      pulse={config.pulse}
    >
      {config.label}
    </BadgeModern>
  );
}

interface CategoryBadgeProps {
  category: string;
  color?: string;
}

export function CategoryBadge({ category, color }: CategoryBadgeProps) {
  const style = color ? {
    backgroundColor: `${color}20`,
    color: color,
    borderColor: `${color}40`,
  } : undefined;

  return (
    <span
      className="badge-modern border"
      style={style}
    >
      {category}
    </span>
  );
}
