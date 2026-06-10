import HeroBand from '@/components/layout/HeroBand';
import BrandTabs from '@/components/layout/BrandTabs';
import ModuleCard from '@/components/landing/ModuleCard';
import { MODULE_GROUPS, getModulesByGroup } from '@/lib/modules';

export default function Home() {
  return (
    <>
      <HeroBand />
      <BrandTabs />
      <section className="px-8 py-10">
        <div className="space-y-10">
          {MODULE_GROUPS.map((group, idx) => {
            const modules = getModulesByGroup(group.key);
            const isLast = idx === MODULE_GROUPS.length - 1;
            return (
              <section key={group.key}>
                <div className="mb-4 flex items-baseline gap-2">
                  <h2
                    className="text-xs uppercase tracking-[0.18em] font-semibold"
                    style={{ color: 'var(--evhub-navy)' }}
                  >
                    {group.label}
                  </h2>
                  {group.sublabel && (
                    <span
                      className="text-xs italic"
                      style={{ color: 'rgba(14,27,44,0.55)' }}
                    >
                      ({group.sublabel})
                    </span>
                  )}
                </div>
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {modules.map(m => (
                    <ModuleCard key={m.key} module={m} />
                  ))}
                </div>
                {!isLast && <hr className="mt-10 border-t border-serif-border" />}
              </section>
            );
          })}
        </div>
      </section>
    </>
  );
}
