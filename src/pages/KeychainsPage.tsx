import { useData } from '../context/DataContext';
import CategoryCard from '../components/CategoryCard';
import { useInView } from '../hooks/useInView';

function ScrollReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(32px)',
      transition: 'opacity 0.6s cubic-bezier(.22,1,.36,1), transform 0.7s cubic-bezier(.22,1,.36,1)',
    }}>
      {children}
    </div>
  );
}

export default function KeychainsPage() {
  const { categories, keychains } = useData();
  const keychainCategories = categories.filter(c => c.type === 'keychain');

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: '#9ED4FB' }}>
        <div className="absolute top-6 right-12 w-40 h-40 rounded-full blur-3xl animate-float-slow pointer-events-none" style={{ background: '#2a80b9', opacity: 0.2 }} />
        <div className="max-w-6xl mx-auto px-4 py-14 md:py-20">
          <div className="max-w-xl">
            <h1 className="font-display text-4xl md:text-6xl mb-4 leading-tight animate-fade-up" style={{ color: '#264653' }}>
              Keychain<br />
              <span style={{ color: '#2a80b9' }}>Collections</span> 🔑
            </h1>
            <p className="text-lg animate-fade-up-d1" style={{ color: '#264653', opacity: 0.75 }}>
              Cute acrylic keychains to take Derpy everywhere you go.
            </p>
          </div>
        </div>
      </section>

      {/* Collections grid */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        {keychainCategories.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🔑</p>
            <p className="text-slate-400 text-lg">No keychain collections yet — check back soon!</p>
          </div>
        ) : (
          <>
            <ScrollReveal className="mb-6">
              <p className="text-sm text-slate-500">{keychainCategories.length} collection{keychainCategories.length !== 1 ? 's' : ''}</p>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {keychainCategories.map((cat, i) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  items={keychains.filter(k => k.collection === cat.id || k.collection === cat.name)}
                  index={i}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
