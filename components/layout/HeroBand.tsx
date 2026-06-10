export default function HeroBand() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: 'var(--evhub-navy)',
        height: 200,
      }}
    >
      {/* Decorative teal blob */}
      <div
        aria-hidden
        className="absolute -right-24 -bottom-24 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(closest-side, rgba(93,202,165,0.55) 0%, rgba(93,202,165,0.18) 55%, rgba(93,202,165,0) 80%)',
          filter: 'blur(2px)',
        }}
      />

      {/* Centred title — 'Evidence Hub™' over a smaller 'by [glyph] Access
          Infinity' sublabel. Glyph sits next to the company name rather
          than at the start of the line. */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center text-white/95">
          <span
            className="font-playfair text-4xl tracking-[0.02em] leading-none"
            style={{ color: '#FFFFFF' }}
          >
            Evidence Hub
            <sup className="text-[0.42em] font-sans align-super ml-0.5 opacity-90">™</sup>
          </span>
          <span className="mt-2 text-white/85 font-playfair italic text-base tracking-[0.03em]">
            Glaukos · iStent infinite
          </span>
        </div>
      </div>

      {/* Bottom-left greeting */}
      <div className="absolute bottom-6 left-8 text-white">
        <h2
          className="font-playfair text-2xl leading-tight"
          style={{ color: '#FFFFFF' }}
        >
          Welcome
        </h2>
        <p className="text-sm text-white/80 mt-0.5">
          Open-Angle Glaucoma evidence, country readiness, and custom applications.
        </p>
      </div>
    </section>
  );
}
