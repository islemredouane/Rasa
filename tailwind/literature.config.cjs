// Tailwind settings for literature.html (moved here from the page's former inline config).
// Compiled into css/literature.css by: node scripts/build-css.mjs
module.exports = {
  content: ["./literature.html", "./js/**/*.js", "./data/**/*.js"],
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/container-queries")],
  ...{
    "darkMode": "class",
    "theme": {
      "extend": {
        "colors": {
          "primary": "#ea6a1f",
          "background-light": "#f8f7f6",
          "background-dark": "#050505",
          "surface-dark": "#121212"
        },
        "fontFamily": {
          "display": [
            "Offside",
            "Space Grotesk",
            "sans-serif"
          ],
          "body": [
            "Quicksand",
            "sans-serif"
          ],
          "sans": [
            "Space Grotesk",
            "sans-serif"
          ]
        },
        "borderRadius": {
          "DEFAULT": "0.5rem",
          "lg": "1rem",
          "xl": "1.5rem",
          "full": "9999px"
        },
        "animation": {
          "shine": "shine 3s linear infinite"
        },
        "keyframes": {
          "shine": {
            "0%": {
              "backgroundPosition": "200% center"
            },
            "100%": {
              "backgroundPosition": "-200% center"
            }
          }
        }
      }
    }
  },
};
