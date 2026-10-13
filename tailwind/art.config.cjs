// Tailwind settings for art.html (moved here from the page's former inline config).
// Compiled into css/art.css by: node scripts/build-css.mjs
module.exports = {
  content: ["./art.html", "./js/**/*.js", "./data/**/*.js"],
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/container-queries")],
  ...{
    "darkMode": "class",
    "theme": {
      "extend": {
        "colors": {
          "primary": "#ea6a1f",
          "primary-dark": "#c5520e",
          "background-dark": "#000000",
          "surface": "#0f0f0f"
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
          ]
        },
        "borderRadius": {
          "DEFAULT": "0.5rem",
          "lg": "1rem",
          "xl": "1.5rem",
          "2xl": "2rem",
          "3xl": "3rem",
          "full": "9999px"
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
        },
        "animation": {
          "shine": "shine 4s linear infinite"
        }
      }
    }
  },
};
