import { useInView } from '../hooks/useInView';

function Section({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, inView } = useInView(0.15);
  return (
    <div
      ref={ref}
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

export default function AboutPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <Section>
        <div className="text-center mb-12">
          <div className="text-6xl mb-4 animate-float inline-block">🦆</div>
          <h1 className="font-display text-4xl md:text-5xl mb-4" style={{ color: '#264653' }}>
            About Us
          </h1>
          <p className="text-lg text-slate-500">More coming soon — stay tuned!</p>
        </div>
      </Section>

      <Section delay={100}>
        <div className="rounded-3xl p-8 text-center shadow-md mb-6" style={{ background: '#9ED4FB' }}>
          <p className="font-display text-2xl" style={{ color: '#264653' }}>
            We're working on this page. 💕
          </p>
          <p className="mt-3 text-slate-600">
            Check back soon for our story, our process, and everything Derpy Derps.
          </p>
        </div>
      </Section>
    </main>
  );
}
