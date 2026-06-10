import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MODULES_BY_KEY, type ModuleKey } from '@/lib/modules';

export default function ModuleStub({ moduleKey }: { moduleKey: ModuleKey }) {
  const m = MODULES_BY_KEY[moduleKey];
  return (
    <div className="px-8 py-12 max-w-3xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-serif-muted-foreground hover:text-serif-foreground transition-colors mb-8"
      >
        <ArrowLeft size={14} />
        Back to landing
      </Link>
      <h1 className="font-playfair text-headline text-serif-foreground mb-3">
        {m.name}
      </h1>
      <p className="text-serif-muted-foreground">
        Module under construction — content arriving soon.
      </p>
    </div>
  );
}
