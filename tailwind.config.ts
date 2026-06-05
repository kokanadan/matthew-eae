import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#030610',
          900: '#060b1a',
          800: '#091022',
          700: '#0c162e',
          600: '#111f42',
          500: '#172850',
        },
        ocean: {
          blue: '#1a6fff',
          glow: '#2288ff',
          cyan: '#00d4ff',
          bright: '#00f5ff',
          deep: '#0044bb',
        },
      },
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        body: ['Barlow', 'sans-serif'],
        condensed: ['"Barlow Condensed"', 'sans-serif'],
      },
      animation: {
        'bubble-rise': 'bubbleRise var(--duration, 8s) ease-in infinite',
        'fade-in-up': 'fadeInUp 0.6s ease forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'scan-line': 'scanLine 2s linear infinite',
        shimmer: 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'skill-fill': 'skillFill 1.2s ease forwards',
      },
      keyframes: {
        bubbleRise: {
          '0%': { transform: 'translateY(100vh) scale(0)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '90%': { opacity: '0.3' },
          '100%': { transform: 'translateY(-20vh) scale(1)', opacity: '0' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 180, 255, 0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 180, 255, 0.5), 0 0 80px rgba(0, 100, 255, 0.2)' },
        },
        scanLine: {
          '0%': { top: '-5%' },
          '100%': { top: '105%' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        skillFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--target-width)' },
        },
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(180deg, #030610 0%, #06112a 50%, #030610 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(10,20,50,0.9) 0%, rgba(5,12,30,0.95) 100%)',
        'border-glow': 'linear-gradient(90deg, transparent, rgba(0,200,255,0.5), transparent)',
        'hero-radial': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,100,255,0.25), transparent)',
      },
    },
  },
  plugins: [],
}

export default config
