/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        surface: '#F9FCFA',
        primary: {
          DEFAULT: '#10B981', // Emerald 500
          mid: '#059669',     // Emerald 600
          light: '#D1FAE5',   // Emerald 100
          tint: '#ECFDF5'     // Emerald 50
        },
        accent: {
          DEFAULT: '#047857', // Emerald 700
          light: '#F0FDF4'    // Green 50
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEF2F2'
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FFFBEB'
        },
        text: {
          black: '#002C1B', // Deep Cinematic Green-Black
          mid: '#024D30',   // Dark Green
          muted: '#4D7D6A'  // Muted Greenish-gray
        },
        border: {
          DEFAULT: '#E5E7EB'
        },
        dark: {
          surface: '#064E3B',
          bg: '#022C22'
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        float: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        insetLine: 'inset 0 1px 0 rgba(255,255,255,0.9)'
      },
      borderRadius: {
        card: '8px',
        btn: '6px',
        input: '6px',
        badge: '999px',
        panel: '12px',
        img: '8px'
      }
    },
  },
  plugins: [],
}
