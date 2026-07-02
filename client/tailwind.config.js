/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A0B', // near-black base
        coal: '#141417', // raised surface
        steel: '#26262B', // borders
        volt: '#CCFF00', // electric primary accent
        ember: '#FF5C2B', // heat / intensity secondary
        bone: '#F4F4F0', // off-white text
        ash: '#8A8A92', // muted text
      },
      fontFamily: {
        // Sora = geometric athletic display; Inter body; Space Mono labels.
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      borderRadius: {
        // softer, modern (the anti-GRINDHOUSE)
        DEFAULT: '0.75rem',
        xl2: '1.25rem',
      },
      boxShadow: {
        volt: '0 0 0 1px rgba(204,255,0,0.4), 0 0 32px rgba(204,255,0,0.25)',
        'volt-sm': '0 0 18px rgba(204,255,0,0.22)',
        lift: '0 18px 50px -12px rgba(0,0,0,0.6)',
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        floaty: 'floaty 5s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2.4s ease-out infinite',
        marquee: 'marquee 24s linear infinite',
      },
    },
  },
  plugins: [],
};
