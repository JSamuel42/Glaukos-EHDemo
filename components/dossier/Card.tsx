import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from 'react';

// Ported from EvHub-D (components/ui/Card.tsx) — Glaukos has no shared ui/Card,
// so the dossier module carries its own copy. Uses serif Tailwind tokens.

export interface CardProps {
  children: ReactNode;
  className?: string;
  accentTop?: boolean;
  interactive?: boolean;
  elevated?: boolean;
  featured?: boolean;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

export function Card({
  children,
  className = '',
  accentTop = false,
  interactive = false,
  elevated = false,
  featured = false,
  onClick,
}: CardProps) {
  const isClickable = Boolean(onClick);
  const handleKeyDown = isClickable
    ? (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(e as unknown as MouseEvent<HTMLDivElement>);
        }
      }
    : undefined;
  const inlineStyle: CSSProperties = {};
  if (featured) {
    inlineStyle.backgroundColor = 'rgba(8,56,96,0.06)';
    inlineStyle.borderTopWidth = '2px';
    inlineStyle.borderTopColor = 'var(--serif-accent)';
  }

  return (
    <div
      className={[
        'relative overflow-hidden rounded-[8px] p-8',
        'border border-serif-border',
        featured ? '' : 'bg-serif-card',
        elevated || featured ? 'shadow-serif-md' : 'shadow-serif-sm',
        interactive
          ? [
              'cursor-pointer',
              'transition-all duration-200 ease-out',
              'hover:shadow-serif-md hover:border-[#D4C5B0]',
            ].join(' ')
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={Object.keys(inlineStyle).length ? inlineStyle : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {accentTop && !featured && (
        <div className="absolute top-0 inset-x-0 h-0.5 bg-serif-accent" />
      )}
      {children}
    </div>
  );
}

export default Card;
