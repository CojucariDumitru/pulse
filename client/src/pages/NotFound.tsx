import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-grid flex items-center justify-center px-6">
      <div className="text-center">
        <p className="label text-volt mb-6">Lost the beat</p>
        <h1 className="display text-[30vw] md:text-[220px] text-outline leading-none">404</h1>
        <p className="text-ash mt-6 mb-10">This page skipped class. Let&apos;s get you back in.</p>
        <Link to="/" className="btn-volt">
          Back home
        </Link>
      </div>
    </div>
  );
}
