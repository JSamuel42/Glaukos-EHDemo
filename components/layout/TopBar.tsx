import Link from 'next/link';
import EvHubLogo from '@/components/brand/EvHubLogo';

export default function TopBar() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-6"
      style={{ backgroundColor: 'var(--evhub-navy)' }}
    >
      <Link href="/" className="text-white">
        <EvHubLogo />
      </Link>
      <div
        className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold"
        style={{ backgroundColor: 'rgba(175,169,236,0.35)', color: '#FFFFFF' }}
        aria-label="User avatar"
      >
        J
      </div>
    </header>
  );
}
