export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        ivory: '#F4EEE4',
        paper: '#EAE1D2',
        ink: '#1D1815',
        stone: '#6B6057',
        line: '#D8CDBC',
        oxblood: '#6B1C22',
        zari: '#A07C3B',
      },
      fontFamily: {
        display: ['"Bodoni Moda"', 'Georgia', 'serif'],
        sans: ['Jost', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        kenburns: {
          '0%': { transform: 'scale(1) translate3d(0,0,0)' },
          '100%': { transform: 'scale(1.1) translate3d(-1.5%,-1%,0)' },
        },
        cue: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(200%)' },
        },
      },
      animation: {
        kenburns: 'kenburns 26s linear infinite alternate',
        cue: 'cue 2.2s linear infinite',
      },
    },
  },
};
