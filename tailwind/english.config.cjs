// Tailwind settings for literature/english.html (moved here from the page's former inline config).
// Compiled into css/english.css by: node scripts/build-css.mjs
module.exports = {
  content: ["./literature/english.html", "./js/**/*.js", "./data/**/*.js"],
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/container-queries")],
  ...{
    "darkMode": "class",
    "theme": {
      "extend": {
        "colors": {
          "primary": "#ea6a1f",
          "primary-dark": "#c5520e",
          "background-light": "#f8f7f6",
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
          "full": "9999px",
          "button": "2rem"
        },
        "backgroundImage": {
          "gradient-metallic": "linear-gradient(to right, #ea6a1f, #f9a825, #ea6a1f)"
        },
        "animation": {
          "float": "float 6s ease-in-out infinite",
          "shine": "shine 3s linear infinite"
        },
        "keyframes": {
          "float": {
            "0%, 100%": {
              "transform": "translateY(0)"
            },
            "50%": {
              "transform": "translateY(-20px)"
            }
          },
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
