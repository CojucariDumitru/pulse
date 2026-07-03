/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#070708', // near-black base — deeper than before
        coal: '#0E0E10', // raised surface
        steel: '#1E1E22', // borders
        volt: '#CCFF00', // the ONE accent — used sparingly
        ember: '#FF5C2B', // heat (waitlist/full states only)
        bone: '#EDEDE8', // off-white text
        ash: '#77777F', // muted text
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      boxShadow: {
        volt: '0 0 0 1px rgba(204,255,0,0.35), 0 0 42px rgba(204,255,0,0.18)',
        'volt-sm': '0 0 22px rgba(204,255,0,0.15)',
        lift: '0 24px 60px -16px rgba(0,0,0,0.75)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
