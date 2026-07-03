import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { SITE, NAV_LINKS, MAPS_DIRECTIONS } from '../../lib/site';

export function Footer() {
  return (
    <footer className="relative bg-ink border-t border-white/10 overflow-hidden">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 pt-20 pb-8">
        {/* top: CTA line */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-16 border-b border-white/10">
          <h2 className="display text-5xl md:text-7xl max-w-2xl">
            Come sweat <span className="text-volt">with us.</span>
          </h2>
          <Link to="/schedule" className="btn-volt shrink-0">
            Book your first class <ArrowUpRight size={15} />
          </Link>
        </div>

        {/* columns */}
        <div className="grid sm:grid-cols-3 gap-10 py-14">
          <div>
            <p className="label text-ash/60 mb-5">Studio</p>
            <ul className="space-y-3">
              {NAV_LINKS.map((l) => (
                <li key={l.to}>
                  {l.to.startsWith('/#') ? (
                    <a href={l.to} className="font-mono text-sm text-bone/80 hover:text-volt transition-colors uppercase tracking-wider">
                      {l.label}
                    </a>
                  ) : (
                    <Link to={l.to} className="font-mono text-sm text-bone/80 hover:text-volt transition-colors uppercase tracking-wider">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="label text-ash/60 mb-5">Find us</p>
            <p className="font-mono text-sm text-bone/80 leading-relaxed uppercase tracking-wider">
              {SITE.address.line1}
              <br />
              {SITE.address.line2}
            </p>
            <a
              href={MAPS_DIRECTIONS}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 label text-ash hover:text-volt transition-colors"
            >
              Directions <ArrowUpRight size={12} />
            </a>
          </div>

          <div>
            <p className="label text-ash/60 mb-5">Contact</p>
            <ul className="space-y-3 font-mono text-sm uppercase tracking-wider">
              <li>
                <a href={SITE.phoneHref} className="text-bone/80 hover:text-volt transition-colors">
                  {SITE.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${SITE.email}`} className="text-bone/80 hover:text-volt transition-colors lowercase">
                  {SITE.email}
                </a>
              </li>
              <li>
                <a href={SITE.social.instagram} target="_blank" rel="noreferrer" className="text-bone/80 hover:text-volt transition-colors">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* legal line */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-6 border-t border-white/10">
          <p className="font-mono text-[10px] text-ash/50 uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} PULSE Studio · SoHo NYC
          </p>
          <p className="font-mono text-[10px] text-ash/40 uppercase tracking-[0.2em]">
            Move loud. Recover louder.
          </p>
        </div>
      </div>

      {/* giant wordmark */}
      <div className="select-none pointer-events-none -mb-[3vw]" aria-hidden>
        <div
          className="display text-[24vw] leading-[0.75] text-center text-transparent"
          style={{ WebkitTextStroke: '1px rgba(237,237,232,0.10)' }}
        >
          PULSE
        </div>
      </div>
    </footer>
  );
}
