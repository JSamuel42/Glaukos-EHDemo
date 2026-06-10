'use client';

import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { MODULE_GROUPS, getModulesByGroup } from '@/lib/modules';
import { cn } from '@/lib/cn';
import SidebarNavItem from './SidebarNavItem';
import { useSidebar } from './SidebarContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();

  return (
    <aside
      className={cn(
        'hidden md:flex fixed left-0 top-14 bottom-0 z-30 bg-white border-r border-serif-border transition-all duration-200 flex-col',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="flex items-center justify-between px-3 py-4 border-b border-serif-border">
        {!collapsed && (
          <button
            type="button"
            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-serif-muted transition-colors"
            aria-label="Brand selector"
          >
            <span
              className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, var(--evhub-mint), var(--evhub-purple))' }}
            >
              GL
            </span>
            <span className="font-playfair text-base text-serif-foreground">Glaukos</span>
            <ChevronDown size={14} className="text-serif-muted-foreground" />
          </button>
        )}
        {collapsed && (
          <span
            className="flex items-center justify-center w-8 h-8 mx-auto rounded-full text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, var(--evhub-mint), var(--evhub-purple))' }}
          >
            GL
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(c => !c)}
          className="p-1 rounded hover:bg-serif-muted text-serif-muted-foreground"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-1">
        {MODULE_GROUPS.map((group, idx) => {
          // Hide coming-soon items from the side nav — they live on the
          // landing page only until their routes are built out.
          const modules = getModulesByGroup(group.key).filter(m => !m.comingSoon);
          return (
            <div key={group.key}>
              {idx > 0 && <hr className="my-2 border-t border-serif-border" />}
              {!collapsed && (
                <div
                  className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-[0.16em] font-semibold"
                  style={{ color: 'var(--evhub-navy)' }}
                >
                  {group.label}
                </div>
              )}
              <ul>
                {modules.map(m => {
                  const active = pathname === m.href || pathname?.startsWith(m.href + '/');
                  return (
                    <li key={m.key}>
                      <SidebarNavItem module={m} active={!!active} collapsed={collapsed} />
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
