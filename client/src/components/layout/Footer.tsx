import { Link } from 'react-router-dom';
import { Instagram, MapPin, Phone, Mail } from 'lucide-react';
import { SITE, NAV_LINKS } from '../../lib/site';
import { Logo } from './Navbar';

export function Footer() {
  return (
    <footer className="relative bg-coal border-t border-steel">
      <div className="mx-auto max-w-7xl px-5 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo className="text-3xl" />
          <p className="label text-volt mt-3">{SITE.tagline}</p>
          <p className="text-ash text-sm mt-5 max-w-xs leading-relaxed">
            Boutique training in SoHo — rhythm spin, HIIT, coached strength and yoga flow. Come
            sweat with us.
          </p>
          <div className="flex gap-3 mt-6">
            <a
              href={SITE.social.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 grid place-items-center rounded-full border border-steel text-ash hover:border-volt hover:text-volt transition-colors"
            >
              <Instagram size={18} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="label text-ash/60 mb-4">Studio</h3>
          <ul className="space-y-3">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                {l.to.startsWith('/#') ? (
                  <a href={l.to} className="font-display font-semibold text-bone hover:text-volt transition-colors">
                    {l.label}
                  </a>
                ) : (
                  <Link to={l.to} className="font-display font-semibold text-bone hover:text-volt transition-colors">
                    {l.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="label text-ash/60 mb-4">Find us</h3>
          <ul className="space-y-4 text-sm text-ash">
            <li className="flex gap-3">
              <MapPin size={17} className="text-volt shrink-0 mt-0.5" />
              <span>
                {SITE.address.line1}
                <br />
                {SITE.address.line2}
              </span>
            </li>
            <li className="flex gap-3">
              <Phone size={17} className="text-volt shrink-0" />
              <a href={SITE.phoneHref} className="hover:text-bone">
                {SITE.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail size={17} className="text-volt shrink-0" />
              <a href={`mailto:${SITE.email}`} className="hover:text-bone">
                {SITE.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-steel">
        <div className="mx-auto max-w-7xl px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-mono text-[11px] text-ash/50">
            © {new Date().getFullYear()} PULSE Studio NYC
          </p>
          <p className="font-mono text-[11px] text-ash/40 uppercase tracking-widest">
            Move loud. Recover louder.
          </p>
        </div>
      </div>
    </footer>
  );
}
