import { ChevronRight, Home } from "lucide-react";
import { useLocation } from "wouter";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const [, setLocation] = useLocation();

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      <button
        onClick={() => setLocation("/dashboard")}
        className="hover:text-foreground transition-colors flex items-center gap-1"
      >
        <Home className="h-4 w-4" />
        <span>Início</span>
      </button>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4" />
          {item.href && index < items.length - 1 ? (
            <button
              onClick={() => setLocation(item.href!)}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className={index === items.length - 1 ? "text-foreground font-medium" : ""}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
