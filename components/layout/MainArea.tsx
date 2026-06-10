'use client';

import { useSidebar } from './SidebarContext';
import { cn } from '@/lib/cn';

/**
 * Client wrapper for the AppShell's <main>. Reads the sidebar collapsed
 * state from context and adjusts left padding accordingly, with a short
 * transition so the content shift feels deliberate rather than snapping.
 */
export default function MainArea({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <main
      className={cn(
        'pt-14 min-h-screen transition-[padding] duration-200 ease-out',
        collapsed ? 'md:pl-16' : 'md:pl-60',
      )}
    >
      <div className="h-full overflow-y-auto">{children}</div>
    </main>
  );
}
