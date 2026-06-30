import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { UserAvatar } from "@/entities/user/components/UserAvatar";
import { Button, Logo } from "@/shared/ui";

const NAV_LINKS = ["Rooms", "Voice", "Pricing", "Changelog"];

export const Navbar = () => {
    const { isAuthenticated, loginWithRedirect } = useAuth0();
    const navigate = useNavigate();

    const openApp = () => {
        if (isAuthenticated) navigate("/rooms");
        else loginWithRedirect({ appState: { returnTo: "/rooms" } });
    };

    return (
        <header className="sticky top-0 z-50 border-b border-border-subtle bg-background/80 backdrop-blur-md">
            <nav className="flex items-center justify-between px-6 py-5 md:px-11">
                <div className="flex items-center gap-9">
                    <Logo to="/" />
                    <div className="hidden items-center gap-7 text-sm text-secondary-text md:flex">
                        {NAV_LINKS.map((link) => (
                            <button
                                key={link}
                                type="button"
                                onClick={link === "Rooms" ? openApp : undefined}
                                className="transition-colors hover:text-foreground"
                            >
                                {link}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    {isAuthenticated ? (
                        <UserAvatar />
                    ) : (
                        <button
                            type="button"
                            onClick={() => loginWithRedirect()}
                            className="text-sm text-secondary-text transition-colors hover:text-foreground"
                        >
                            Sign in
                        </button>
                    )}
                    <Button size="sm" onClick={openApp}>
                        Open app
                    </Button>
                </div>
            </nav>
        </header>
    );
};
