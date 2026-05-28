import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom"

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const onRedirectCallback = (appState: any) => {
        navigate(appState?.returnTo || window.location.pathname);
    };

    return (
        <Auth0Provider
            domain="dev-z5i1q0l732g5x11x.us.auth0.com"
            clientId="8c3tYk80i729qO5qF5bF3r3ZzC4E8w9n"
            authorizationParams={{
                redirect_uri: window.location.origin
            }}
            onRedirectCallback={onRedirectCallback}
        >
            {children}
        </Auth0Provider>
    );
}