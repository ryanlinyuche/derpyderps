import { useState } from 'react';
import { useData } from '../context/DataContext';
import KeychainCard from '../components/KeychainCard';
import { useInView } from '../hooks/useInView';

function ScrollReveal({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(28px)',
      transition: 'opacity 0.6s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1)',
    }}>
      {children}
    </div>
  );
}

export default function KeychainsPage() {
  const { keychains } = useData();
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  const collections = Array.from(new Set(keychains.map(k => k.collection).filter(Boolean))) as string[];
  const filtered = activeCollection ? keychains.filter(k => k.collection === activeCollection) : keychains;
  const featured = keychains.filter(k => k.featured);

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: '#9ED4FB' }}>
        <div className="absolute top-6 right-12 w-40 h-40 rounded-full blur-3xl animate-float-slow pointer-events-none" style={{ background: '#2a80b9', opacity: 0.2 }} />
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="max-w-xl">
            <div className="text-5xl mb-4 animate-float">🔑</div>
            <h1 className="font-display text-4xl md:text-5xl mb-3 leading-tight animate-fade-up" style={{ color: '#264653' }}>
              Keychains
            </h1>
            <p className="text-lg animate-fade-up-d1" style={{ color: '#264653', opacity: 0.75 }}>
              Carry your favorite Derpy Derps wherever you go!
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {keychains.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔑</div>
            <p className="text-slate-500 text-lg">No keychains yet — check back soon!</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured.length > 0 && (
              <ScrollReveal>
                <section className="mb-10">
                  <h2 className="font-display text-xl mb-4" style={{ color: '#264653' }}>⭐ Featured</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {featured.map((k, i) => <KeychainCard key={k.id} keychain={k} index={i} />)}
                  </div>
                </section>
              </ScrollReveal>
            )}

            {/* Collection filter */}
            {collections.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setActiveCollection(null)}
                  className="text-sm font-bold px-4 py-1.5 rounded-full transition-all"
                  style={{
                    background: !activeCollection ? '#2a80b9' : 'transparent',
                    color: !activeCollection ? 'white' : '#264653',
                    border: !activeCollection ? 'none' : '1px solid rgba(42,128,185,0.25)',
                  }}
                >
                  All
                </button>
                {collections.map(col => (
                  <button
                    key={col}
                    onClick={() => setActiveCollection(col)}
                    className="text-sm font-bold px-4 py-1.5 rounded-full transition-all"
                    style={{
                      background: activeCollection === col ? '#2a80b9' : 'transparent',
                      color: activeCollection === col ? 'white' : '#264653',
                      border: activeCollection === col ? 'none' : '1px solid rgba(42,128,185,0.25)',
                    }}
                  >
                    {col}
                  </button>
                ))}
              </div>
            )}

            {/* Grid */}
            <ScrollReveal>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filtered.map((k, i) => <KeychainCard key={k.id} keychain={k} index={i} />)}
              </div>
            </ScrollReveal>
          </>
        )}
      </div>
    </main>
  );
}
