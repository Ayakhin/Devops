import React, { useState, useCallback, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useNavigate } from 'react-router-dom';

// =====================================================================
// DÉFINITIONS ET SIMULATIONS D'API
// =====================================================================
interface LoginResponse {
    success: boolean;
    message: string;
}
// const navigate = useNavigate();

// Fonction qui simule l'appel à votre API backend (l'endpoint Express /api/login)
const simulateLoginAPI = async (email: string, password: string): Promise<LoginResponse> => {
    // Simuler un délai réseau pour l'expérience utilisateur
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Logique de validation simulée : utilisez ces identifiants pour réussir
    if (email === 'admin@devops.com' && password === 'motdepasse') {
        return { success: true, message: 'Connexion réussie ! Redirection vers le tableau de bord...' };        
    } else {
        // Simuler une réponse 401
        return { success: false, message: 'Identifiants invalides. Veuillez réessayer.' };
    }
};

// =====================================================================
// LOGIQUE DE GESTION DU THÈME
// =====================================================================

type Theme = 'light' | 'dark' | 'auto';

const getPreferredTheme = (): Theme => {
    // Récupérer le thème enregistré dans localStorage ou utiliser 'auto' par défaut
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme && storedTheme !== 'auto') {
        return storedTheme;
    }
    // Déterminer le thème actuel en fonction de la préférence système
    return (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') as Theme;
};

const setBodyTheme = (theme: Theme) => {
    const htmlElement = document.querySelector('html');
    if (htmlElement) {
        // Applique le thème sur la balise <html>, ce que Bootstrap utilise
        htmlElement.setAttribute('data-bs-theme', theme === 'auto' ? getPreferredTheme() : theme);
        localStorage.setItem('theme', theme);
    }
};

/**
 * Composant de page de connexion, reproduisant fidèlement le template Bootstrap Sign-In
 * et intégrant la logique de gestion du thème.
 */
const Login: React.FC = () => {

    const navigate = useNavigate(); // Add this at the top of the component
    // 1. Gestion de l'état du formulaire
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [rememberMe, setRememberMe] = useState<boolean>(false);
    
    // 2. Gestion de l'état de la connexion
    const [loading, setLoading] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState<boolean>(false);

    // 3. Gestion de l'état du thème
    const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
        // Initialiser le thème au montage du composant
        const initialTheme = localStorage.getItem('theme') as Theme || 'auto';
        // Applique immédiatement le thème pour éviter le flash de contenu non stylisé
        setBodyTheme(initialTheme); 
        return initialTheme;
    });

    // Synchronise le thème réel de l'application lorsque l'état change
    useEffect(() => {
        setBodyTheme(currentTheme);
    }, [currentTheme]);

    // Écoute les changements de thème système (pour le mode 'auto')
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            if (currentTheme === 'auto') {
                setBodyTheme('auto'); // Re-détermine la préférence système
            }
        };
        // Détecte le changement de préférence système
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [currentTheme]);

    const handleThemeChange = (newTheme: Theme) => {
        setCurrentTheme(newTheme);
    };

    // 4. Fonction de soumission asynchrone
    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatusMessage(null);
        setIsError(false);
        setLoading(true);

        try {
            const response = await simulateLoginAPI(email, password);

            if (response.success) {
                setStatusMessage(response.message);
                setIsError(false);
                navigate('/home');
                // Logique de succès (stockage du jeton, redirection, etc.)
            } else {
                setStatusMessage(response.message);
                setIsError(true);
            }
        } catch (error) {
            console.error("Erreur lors de l'appel API:", error);
            setStatusMessage('Erreur de connexion : impossible de joindre le serveur.');
            setIsError(true);
        } finally {
            setLoading(false);
        }

    }, [email, password, rememberMe]);


    // Rendu du composant
    return (
        <>
            {/* 1. STYLES CSS INTÉGRÉS (Reproduction de sign-in.css) */}
            <style>{`
                /* Styles essentiels pour que les inputs flottants "collent" et pour le bouton de thème */
                .form-signin input[type="email"] {
                    margin-bottom: -1px;
                    border-bottom-right-radius: 0;
                    border-bottom-left-radius: 0;
                }
                .form-signin input[type="password"] {
                    margin-bottom: 10px;
                    border-top-left-radius: 0;
                    border-top-right-radius: 0;
                }
                .form-signin .form-floating:focus-within {
                    z-index: 2;
                }
                .bd-mode-toggle {
                    z-index: 1500;
                }
                .bd-mode-toggle .bi {
                    width: 1em;
                    height: 1em;
                }
                .btn-bd-primary {
                    --bd-violet-bg: #712cf9;
                    --bs-btn-font-weight: 600;
                    --bs-btn-color: var(--bs-white);
                    --bs-btn-bg: var(--bd-violet-bg);
                    --bs-btn-border-color: var(--bd-violet-bg);
                    --bs-btn-hover-bg: #6528e0;
                    --bs-btn-hover-border-color: #6528e0;
                    --bs-btn-active-bg: #5a23c8;
                    --bs-btn-active-border-color: #5a23c8;
                }
            `}</style>

            {/* 2. SYMBOLES SVG POUR LE THÈME TOGGLE */}
            <svg xmlns="http://www.w3.org/2000/svg" className="d-none">
                <symbol id="check2" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"></path>
                </symbol>
                <symbol id="circle-half" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 0 8 1v14zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16z"></path>
                </symbol>
                <symbol id="moon-stars-fill" viewBox="0 0 16 16">
                    <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"></path>
                    <path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z"></path>
                </symbol>
                <symbol id="sun-fill" viewBox="0 0 16 16">
                    <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"></path>
                </symbol>
            </svg>

            {/* 3. LE BOUTON DE THÈME (Theme Toggle) */}
            <div
                className="dropdown position-fixed bottom-0 end-0 mb-3 me-3 bd-mode-toggle"
            >
                <button
                    className="btn btn-bd-primary py-2 dropdown-toggle d-flex align-items-center"
                    id="bd-theme"
                    type="button"
                    aria-expanded="false"
                    data-bs-toggle="dropdown"
                    aria-label={`Toggle theme (${currentTheme})`}
                >
                    {/* Affiche l'icône du thème actif */}
                    <svg className="bi my-1 theme-icon-active" aria-hidden="true">
                        <use href={
                            currentTheme === 'light' ? "#sun-fill" :
                            currentTheme === 'dark' ? "#moon-stars-fill" :
                            getPreferredTheme() === 'dark' ? "#moon-stars-fill" : "#sun-fill"
                        }></use>
                    </svg>
                    <span className="visually-hidden" id="bd-theme-text">Toggle theme</span>
                </button>
                <ul
                    className="dropdown-menu dropdown-menu-end shadow"
                    aria-labelledby="bd-theme-text"
                >
                    <li>
                        <button
                            type="button"
                            className={`dropdown-item d-flex align-items-center ${currentTheme === 'light' ? 'active' : ''}`}
                            onClick={() => handleThemeChange('light')}
                            aria-pressed={currentTheme === 'light'}
                        >
                            <svg className="bi me-2 opacity-50" aria-hidden="true"><use href="#sun-fill"></use></svg>
                            Light
                            {currentTheme === 'light' && <svg className="bi ms-auto" aria-hidden="true"><use href="#check2"></use></svg>}
                        </button>
                    </li>
                    <li>
                        <button
                            type="button"
                            className={`dropdown-item d-flex align-items-center ${currentTheme === 'dark' ? 'active' : ''}`}
                            onClick={() => handleThemeChange('dark')}
                            aria-pressed={currentTheme === 'dark'}
                        >
                            <svg className="bi me-2 opacity-50" aria-hidden="true"><use href="#moon-stars-fill"></use></svg>
                            Dark
                            {currentTheme === 'dark' && <svg className="bi ms-auto" aria-hidden="true"><use href="#check2"></use></svg>}
                        </button>
                    </li>
                    <li>
                        <button
                            type="button"
                            className={`dropdown-item d-flex align-items-center ${currentTheme === 'auto' ? 'active' : ''}`}
                            onClick={() => handleThemeChange('auto')}
                            aria-pressed={currentTheme === 'auto'}
                        >
                            <svg className="bi me-2 opacity-50" aria-hidden="true"><use href="#circle-half"></use></svg>
                            Auto
                            {currentTheme === 'auto' && <svg className="bi ms-auto" aria-hidden="true"><use href="#check2"></use></svg>}
                        </button>
                    </li>
                </ul>
            </div>

            {/* 4. LE CONTENEUR PRINCIPAL DU FORMULAIRE */}
            {/* W-100 est ajouté pour assurer la fluidité sur le viewport. */}
            <div className="d-flex align-items-center py-4 bg-body-tertiary w-100" style={{ minHeight: '100vh' }}>
                <main className="form-signin w-100 m-auto">
                    <form onSubmit={handleSubmit}>
                        
                        {/* Image : Utilisation d'un placeholder pour l'icône de Bootstrap */}
                        <img
                            className="mb-4 d-block mx-auto"
                            src="../assets/brand/wp4507672.png"
                            alt="eliot alderson"
                            width="100%"
                            height=""
                        />
                        
                        <h1 className="h3 mb-3 fw-normal">Connexion</h1>

                        {/* Messages de statut */}
                        {statusMessage && (
                            <div 
                                className={`alert ${isError ? 'alert-danger' : 'alert-success'} d-flex align-items-center p-2 mb-3`} 
                                role="alert"
                            >
                                <svg className="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label={isError ? "Erreur:" : "Succès:"}>
                                    <use href={isError ? "#circle-half" : "#check2"}/>
                                </svg>
                                <div>
                                    {statusMessage}
                                </div>
                            </div>
                        )}
                        
                        {/* Champ Email */}
                        <div className="form-floating">
                            <input
                                type="email"
                                className="form-control"
                                id="floatingInput"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <label htmlFor="floatingInput">Email</label>
                        </div>
                        
                        {/* Champ Mot de passe */}
                        {/* Ces deux divs form-floating sont maintenant collés grâce aux styles spécifiques ajoutés ci-dessus */}
                        <div className="form-floating">
                            <input
                                type="password"
                                className="form-control"
                                id="floatingPassword"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <label htmlFor="floatingPassword">Mot de passe</label>
                        </div>
                        
                        {/* Checkbox Remember Me */}
                        <div className="form-check text-start my-3">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                value="remember-me"
                                id="checkDefault"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                disabled={loading}
                            />
                            <label className="form-check-label" htmlFor="checkDefault">
                                Se souvenir de moi
                            </label>
                        </div>
                        
                        {/* Bouton de soumission */}
                        <button 
                            className="btn btn-primary w-100 py-2" 
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Se connecter
                                </>
                            ) : (
                                'Se connecter'
                            )}
                        </button>
                        
                        <p className="mt-5 mb-3 text-body-secondary">&copy; 2017–2025</p>
                    </form>
                </main>
            </div>
        </>
    );
};

// =====================================================================
// INITIALISATION REACT (REND LE COMPOSANT DANS index.html)
// =====================================================================

const rootElement = document.getElementById('root');
if (rootElement) {
    createRoot(rootElement).render(<Login />);
}

export default Login;