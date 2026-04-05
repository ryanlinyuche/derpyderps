import { Link } from 'react-router-dom';
import { Category, Sticker } from '../data/stickers';
import { useInView } from '../hooks/useInView';

interface Props {
  category: Category;
  stickers: Sticker[];
  index?: number;
}

export default function CategoryCard({ category, stickers, index = 0 }: Props) {
  const preview = stickers.slice(0, 3);
  const extra = stickers.length > 3 ? stickers.length - 3 : 0;
  const { ref, inView } = useInView(0.12);
  const delay = (index % 3) * 100;

  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(40px)',
      transition: `opacity 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    }}>
      <Link
        to={`/category/${category.id}`}
        className="group block rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.9)' }}
      >
        <div className={`h-1.5 bg-gradient-to-r ${category.color}`} />

        <div className="p-5">
          <div className="flex items-center gap-4 mb-4">
            <span className={`text-3xl w-14 h-14 flex items-center justify-center rounded-2xl bg-gradient-to-br ${category.color} shadow-inner flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
              {category.emoji}
            </span>
            <div>
              <h3 className="font-display text-lg transition-colors leading-tight group-hover:opacity-75" style={{ color: '#264653' }}>
                {category.name}
              </h3>
              <p className="text-sm text-slate-400 mt-0.5">{stickers.length} sticker{stickers.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {preview.map((s, i) => (
              <div
                key={s.id}
                className="w-14 h-14 rounded-full border-2 border-white shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                style={{ background: '#DEF1FF', transitionDelay: `${i * 40}ms` }}
              >
                <img src={s.image} alt={s.name} className="max-w-full max-h-full object-contain p-1 mix-blend-multiply" />
              </div>
            ))}
            {extra > 0 && (
              <div className="w-14 h-14 rounded-full border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0" style={{ background: '#9ED4FB' }}>
                <span className="text-sm font-bold" style={{ color: '#264653' }}>+{extra}</span>
              </div>
            )}
            <span className="ml-auto text-base font-bold group-hover:translate-x-1 transition-transform duration-200" style={{ color: '#2a80b9' }}>→</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
