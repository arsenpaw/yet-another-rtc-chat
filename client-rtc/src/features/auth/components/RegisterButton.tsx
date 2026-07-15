import { Button } from "@/shared/components";
import { useAuth0 } from "@auth0/auth0-react";

export const RegisterButton = () => {
    const { loginWithRedirect } = useAuth0();
    return (
        <Button
            size="lg"
            variant="outline"
            onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: "signup" } })}>
            Sign Up
        </Button>
    );
};