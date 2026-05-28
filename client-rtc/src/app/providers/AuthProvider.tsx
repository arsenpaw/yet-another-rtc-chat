import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom"

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const onRedirectCallback = (appState: any) => {
        navigate(appState?.returnTo || window.location.pathname);
    };

    return (
        <Auth0Provider
            domain="dev-rtc-identity.eu.auth0.com"
            clientId="QiYk2G0UHh7NrORUCqfY7BlUAc49oWSr"
            authorizationParams={{
                redirect_uri: window.location.origin
            }}
            onRedirectCallback={onRedirectCallback}
        >
            {children}
        </Auth0Provider>
    );
}