import { Button } from "@/shared/components";
import { useAuth0 } from "@auth0/auth0-react";

export const LoginButton = () => {
    const { loginWithRedirect } = useAuth0();
    return (
        <Button size="lg" onClick={() => loginWithRedirect()}>Sign In</Button>
    );
};