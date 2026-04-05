import { Sticker } from '../data/stickers';

interface Props { stickers: Sticker[]; }

export default function StickerMarquee({ stickers }: Props) {
  // Double so the loop is seamless
  const doubled = [...stickers, ...stickers];
  return (
    <div className="overflow-hidden py-3">
      <div className="flex gap-4 animate-slide-left" style={{ width: 'max-content' }}>
        {doubled.map((s, i) => (
          <div
            key={`${s.id}-${i}`}
            className="w-14 h-14 bg-white/70 rounded-2xl shadow flex items-center justify-center flex-shrink-0 hover:scale-125 hover:bg-white transition-transform duration-200 cursor-pointer"
          >
            <img src={s.image} alt={s.name} className="max-w-full max-h-full object-contain p-1 drop-shadow" />
          </div>
        ))}
      </div>
    </div>
  );
}
