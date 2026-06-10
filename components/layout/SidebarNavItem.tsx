'use client';

import Link from 'next/link';
import type { ModuleDef } from '@/lib/modules';
import { cn } from '@/lib/cn';

export default function SidebarNavItem({
  module: m,
  active,
  collapsed,
}: {
  module: ModuleDef;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = m.icon;
  return (
    <Link
      href={m.href}
      title={collapsed ? m.name : undefined}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 mx-2 my-0.5 rounded-md text-sm transition-colors',
        active
          ? 'bg-[rgba(93,202,165,0.15)] text-serif-foreground font-semibold'
          : 'text-serif-muted-foreground hover:bg-serif-muted hover:text-serif-foreground',
      )}
    >
      <span
        className={cn(
          'flex-shrink-0',
          active ? 'text-[#0F6E56]' : 'text-serif-muted-foreground',
        )}
      >
        <Icon size={18} />
      </span>
      {!collapsed && <span className="truncate">{m.name}</span>}
    </Link>
  );
}
