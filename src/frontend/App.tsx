import React from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import { 
    BrowserRouter as Router, 
    Routes, 
    Route, 
    Link 
} from 'react-router-dom';
import Login from './Login';
import Home from './Home';

const App: React.FC = () => {
  return (

    <Router>
        {/*
          LIENS CDN DE BOOTSTRAP: Ces liens sont nécessaires pour appliquer
          les styles et scripts Bootstrap à l'ensemble de l'application.
        */}
        <link 
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" 
            rel="stylesheet" 
            integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" 
            crossOrigin="anonymous" 
        />
        <script 
            src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" 
            integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" 
            crossOrigin="anonymous" 
            defer
        ></script>

        {/* CONTENU ET ROUTES */}
        <Routes>
            {/* Route Login */}
            <Route path="/" element={<Login />} />
            {/* Route Home */}
            <Route path="/home" element={<Home />} />
        </Routes>

    </Router>
  );
};

const rootElement = document.getElementById("root");
const root = createRoot(rootElement!);
root.render(<App />);
