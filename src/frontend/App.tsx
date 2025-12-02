import React from "react";
import { createRoot } from "react-dom/client";

const App = () => {
  return (
    <div>
      {/* <h1>Hello World - React + TypeScript + Webpack</h1>
      <p>Votre application fonctionne correctement ✔</p> */}
    </div>
  );
};

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);
root.render(<App />);
