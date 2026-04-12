import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import FeaturedCarousel from '../components/FeaturedCarousel';
import CategoryCard from '../components/CategoryCard';
import StickerMarquee from '../components/StickerMarquee';
import KeychainCard from '../components/KeychainCard';
import { useInView } from '../hooks/useInView';

function ScrollReveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { stickers, categories, banner, keychains } = useData();
  const featured = stickers.filter(s => s.featured);
  const featuredKeychains = keychains.filter(k => k.featured).slice(0, 4);
  const previewKeychains = featuredKeychains.length > 0 ? featuredKeychains : keychains.slice(0, 4);

  return (
    <main>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{
        background: '#9ED4FB',
        ...(banner.backgroundImage ? {
          backgroundImage: `url(${banner.backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : {}),
      }}>
        <div className="absolute top-6 right-12 w-40 h-40 rounded-full blur-3xl animate-float-slow pointer-events-none" style={{ background: '#2a80b9', opacity: 0.2 }} />
        <div className="absolute bottom-4 left-16 w-28 h-28 rounded-full blur-2xl animate-float-delay pointer-events-none" style={{ background: '#2a80b9', opacity: 0.15 }} />

        <div className="max-w-6xl mx-auto px-4 py-14 md:py-20">
          <div className="max-w-xl">
            <h1 className="font-display text-4xl md:text-6xl mb-4 leading-tight animate-fade-up" style={{ color: '#264653' }}>
              {banner.title}<br />
              <span style={{ color: '#2a80b9' }}>{banner.titleHighlight}</span> {banner.emoji}
            </h1>
            <p className="text-lg mb-6 animate-fade-up-d1" style={{ color: '#264653', opacity: 0.75 }}>
              {banner.subtitle}
            </p>
            <div className="flex flex-wrap gap-2 animate-fade-up-d2">
              {banner.tags.map(tag => (
                <span key={tag} className="text-sm px-4 py-1.5 rounded-full border" style={{ background: 'rgba(38,70,83,0.08)', color: '#264653', borderColor: 'rgba(38,70,83,0.2)' }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div style={{ background: 'rgba(158,212,251,0.3)', borderTop: '1px solid rgba(158,212,251,0.5)', borderBottom: '1px solid rgba(158,212,251,0.5)' }}>
        <StickerMarquee stickers={stickers} />
      </div>

      {/* ── Featured Carousel ── */}
      {featured.length > 0 && (
        <ScrollReveal className="max-w-6xl mx-auto px-4 pt-10">
          <FeaturedCarousel stickers={featured} />
        </ScrollReveal>
      )}

      {/* ── Keychains teaser ── */}
      {previewKeychains.length > 0 && (
        <ScrollReveal className="max-w-6xl mx-auto px-4 pt-10 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔑</span>
              <h2 className="font-display text-2xl" style={{ color: '#264653' }}>Keychains</h2>
            </div>
            <button
              onClick={() => navigate('/keychains')}
              className="text-sm font-semibold text-[#2a80b9] hover:underline"
            >
              View all →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {previewKeychains.map((k, i) => (
              <KeychainCard key={k.id} keychain={k} index={i} />
            ))}
          </div>
        </ScrollReveal>
      )}

      {/* ── Categories ── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <ScrollReveal>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🗂️</span>
            <h2 className="font-display text-2xl" style={{ color: '#264653' }}>Browse Categories</h2>
          </div>
          <p className="text-sm mb-6 text-slate-500">Click on a category to explore all stickers</p>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              stickers={stickers.filter(s => s.category_id === cat.id)}
              index={i}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
