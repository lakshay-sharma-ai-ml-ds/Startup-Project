export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sheriff: {
          orange: '#F97316', 'orange-dark': '#EA580C',
          dark: '#0D1117', 'dark-2': '#161B22', 'dark-3': '#1C2333', 'dark-4': '#21262D',
          border: '#30363D', text: '#E6EDF3', muted: '#8B949E',
          red: '#F85149', green: '#3FB950', yellow: '#D29922', blue: '#58A6FF',
        }
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        'pulse-glow': { '0%,100%': { boxShadow: '0 0 20px rgba(249,115,22,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(249,115,22,0.6)' } },
        'scan-line': { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100vh)' } },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scan-line': 'scan-line 3s linear infinite',
      }
    }
  },
  plugins: []
}