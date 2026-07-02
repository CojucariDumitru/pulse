import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink bg-grid flex items-center justify-center px-5">
      <div className="text-center">
        <p className="label text-volt mb-4">Lost the beat</p>
        <h1 className="font-display font-extrabold text-[26vw] md:text-[180px] leading-none text-volt glow-volt">
          404
        </h1>
        <p className="text-ash mt-4 mb-8">This page skipped class. Let's get you back in.</p>
        <Link to="/" className="btn-volt">
          Back home
        </Link>
      </div>
    </div>
  );
}
