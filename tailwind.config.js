module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1020px',
      xl: '1440px'
    },
    extend: {
      colors: {
        violet: {
          DEFAULT: '#7B68EE',
          50: '#eeefff',
          100: '#e1e2fe',
          200: '#c8cafd',
          300: '#a7a7fa',
          400: '#8c84f5',
          500: '#7b68ee',
          600: '#6b4ae1',
          700: '#5d3bc7',
          800: '#4b33a0',
          900: '#40307f',
          950: '#261c4a'
        },

        grape: {
          DEFAULT: '#a97ad8',
          50: '#f9f5fd',
          100: '#f2edfa',
          200: '#e1d6f4',
          300: '#d4c3ef',
          400: '#bfa1e4',
          500: '#a97ad8',
          600: '#9a5dca',
          700: '#8a4bb6',
          800: '#733e99',
          900: '#5f357d',
          950: '#3d2154'
        },

        rose: {
          DEFAULT: '#faa7b7',
          ERROR: '#f77591',
          50: '#fff1f3',
          100: '#fee5e9',
          200: '#fdced7',
          300: '#faa7b7',
          400: '#f77591',
          500: '#ef476f',
          600: '#db2357',
          700: '#b9174a',
          800: '#9b1644',
          900: '#85163f',
          950: '#4a071e'
        },

        slushi: {
          DEFAULT: '#8ec5fc',
          50: '#eff6ff',
          100: '#dbebfe',
          200: '#c0ddfd',
          300: '#8ec5fc',
          400: '#61a9f9',
          500: '#3c87f5',
          600: '#2769e9',
          700: '#1e54d7',
          800: '#1f45ae',
          900: '#1f3d89',
          950: '#172754'
        },

        grey: {
          DEFAULT: '#bbb5c4',
          50: '#f7f7f8',
          100: '#efedf1',
          200: '#dbd7e0',
          300: '#bbb5c4',
          400: '#948ca4',
          500: '#807691',
          600: '#625871',
          700: '#50485c',
          800: '#453e4e',
          900: '#3c3743',
          950: '#29242d'
        }

        // gradient: 'linear-gradient(62deg, #7b68ee 0%, #8ec5fc 87%)'
      },
      fontFamily: {
        sans: ['Nunito Sans', 'sans-serif']
      },
      animation: {
        fade: 'fadeOut 0.3s ease-in'
      },
      keyframes: {
        fadeOut: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    }
  },
  plugins: []
};
