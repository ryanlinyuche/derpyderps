import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import StickerCard from '../components/StickerCard';
import { useInView } from '../hooks/useInView';

function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

export default function CategoryPage() {
  const { id } = useParams();
  const { stickers, categories } = useData();
  const category = categories.find(c => c.id === id);
  const catStickers = stickers.filter(s => s.category_id === id);

  if (!category) return (
    <div className="text-center py-24">
      <p className="text-5xl mb-4">😢</p>
      <p className="text-slate-500 text-lg">Category not found</p>
      <Link to="/" className="mt-4 inline-block" style={{ color: '#2a80b9' }}>← Back home</Link>
    </div>
  );

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm mb-6 transition-colors" style={{ color: '#2a80b9' }}>
        ← Back to all categories
      </Link>

      {/* Category hero */}
      <ScrollReveal>
        <div className={`rounded-3xl p-6 md:p-10 mb-10 bg-gradient-to-br ${category.color} text-white shadow-xl relative overflow-hidden`}>
          <div className="absolute top-4 right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-2 left-8 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float pointer-events-none" />
          <div className="relative">
            <span className="text-5xl mb-3 block animate-float">{category.emoji}</span>
            <h1 className="font-display text-3xl md:text-4xl mb-2">{category.name}</h1>
            {category.description && <p className="text-white/80 text-base">{category.description}</p>}
            <p className="text-white/60 text-sm mt-2">{catStickers.length} sticker{catStickers.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </ScrollReveal>

      {catStickers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🦆</p>
          <p className="text-slate-500">No stickers in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {catStickers.map((s, i) => (
            <StickerCard key={s.id} sticker={s} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}
