/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/**/*.ejs', // Ruta a tus archivos EJS
    './public/**/*.js',  // Si tienes scripts JS
  ],
  theme: {
    extend: {
      maxWidth:{
        aministrador: "calc(100vw - 200px)"
      }
    },
  },
  plugins: [],
}

