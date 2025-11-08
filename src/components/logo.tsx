import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2 font-headline text-lg font-bold', className)}>
      <div className="p-1.5 bg-sidebar-primary rounded-md">
        <Search className="h-5 w-5 text-sidebar-primary-foreground" />
      </div>
      <span className="text-sidebar-foreground group-data-[collapsible=icon]:hidden">SatyaShodh</span>
    </div>
  );
}
