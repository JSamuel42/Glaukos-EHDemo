import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ModuleDef } from '@/lib/modules';

/**
 * Landing-page module tile. Coming-soon modules render as a non-clickable
 * <div> with a 'Coming Soon' pill in place of the CTA chevron; everything
 * else is a Link to the module's route.
 */
export default function ModuleCard({ module: m }: { module: ModuleDef }) {
  const Icon = m.icon;

  const body = (
    <>
      <span className="eh-card-icon">
        <Icon size={18} strokeWidth={1.6} />
      </span>
      <h3 className="eh-card-title">{m.name}</h3>
      <p className="eh-card-desc">{m.cardBlurb}</p>
      {m.comingSoon ? (
        <span
          className="inline-flex items-center self-start px-2.5 py-1 rounded-full text-[11px] uppercase tracking-[0.12em] font-mono font-semibold"
          style={{
            backgroundColor: 'rgba(75,85,99,0.10)',
            color: '#4B5563',
          }}
        >
          Coming Soon
        </span>
      ) : (
        <span className="eh-card-cta">
          {m.cardCta}
          <ArrowRight size={14} />
        </span>
      )}
    </>
  );

  if (m.comingSoon) {
    return (
      <div
        className="eh-card eh-card--coming-soon"
        aria-disabled="true"
        title="Coming Soon"
      >
        {body}
      </div>
    );
  }

  return (
    <Link href={m.href} className="eh-card group">
      {body}
    </Link>
  );
}
