const path = require("path");

module.exports = {
  // Point d'entrée de l'application React
  entry: "./src/frontend/App.tsx",

  // Sortie du bundle compilé
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "bundle.js",
  },

  // Active le mode développement (source map + outil de dev)
  mode: "development",

  // Permet de débugger facilement (console, fichiers originaux)
  devtool: "source-map",

  // Configuration pour gérer les .ts et .tsx
  module: {
    rules: [
      {
        test: /\.tsx?$/, // Pour .ts et .tsx
        use: "ts-loader", // Transpile TypeScript
        exclude: /node_modules/,
      },
    ],
  },

  // Extensions que Webpack va résoudre automatiquement
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },

  // DevServer pour lancer ton frontend automatiquement
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    port: 3000,           // Ton app sera dispo ici → http://localhost:3000
    hot: true,            // Reload automatique (sans perdre l'état)
    open: true,           // Ouvre le navigateur automatiquement
  },
};
