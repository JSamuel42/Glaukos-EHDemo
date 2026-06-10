'use client';

import { useState } from 'react';
import { BRANDS, ACTIVE_BRAND_DEFAULT, type BrandKey } from '@/lib/brands';
import { cn } from '@/lib/cn';

const ACTIVE_BG = '#B3ABE5';
const INACTIVE_BG = '#D3D9DF';

export default function BrandTabs() {
  const [active, setActive] = useState<BrandKey>(ACTIVE_BRAND_DEFAULT);

  return (
    <nav className="bg-white px-8 pt-5 pb-4" aria-label="Brand selector">
      <ul className="flex flex-wrap items-center gap-2">
        {BRANDS.map(b => {
          const isActive = b.key === active;
          return (
            <li key={b.key}>
              <button
                type="button"
                onClick={() => {
                  if (b.populated) {
                    setActive(b.key);
                  } else {
                    console.log(`[brand] ${b.name} — coming soon`);
                  }
                }}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'font-semibold text-serif-foreground'
                    : 'font-normal text-serif-foreground/75 hover:text-serif-foreground',
                )}
                style={{
                  backgroundColor: isActive ? ACTIVE_BG : INACTIVE_BG,
                }}
                aria-pressed={isActive}
              >
                {b.name}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
