import { UserAvatar } from "@/entities/user/components/UserAvatar";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/shared/components/ui";
import { MessagesSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { LoginButton, RegisterButton } from "@/features/auth/components";

export const Navbar = () => {
    const { isAuthenticated } = useAuth0();

    return (
        <NavigationMenu className="bg-surface/80 border-b border-border w-full max-w-full">
            <div className="flex items-center w-full px-6 py-4">
                <div className="flex-1">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="rounded-full bg-primary p-2">
                            <MessagesSquare size={16} className="text-secondary" />
                        </div>
                        <span className="text-2xl text-primary font-semibold font-serif tracking-tight">
                            Yet Another RTC Chat
                        </span>
                    </Link>
                </div>

                <NavigationMenuList className="flex items-center gap-1">
                    {isAuthenticated && (
                        <>
                            <NavigationMenuItem>...</NavigationMenuItem>
                            <NavigationMenuItem>...</NavigationMenuItem>
                        </>
                    )}
                </NavigationMenuList>

                <div className="flex-1 flex justify-end">
                    {isAuthenticated ? (
                        <UserAvatar />
                    ) : (
                        <div className="flex items-center gap-2">
                            <RegisterButton />
                            <LoginButton />
                        </div>
                    )}
                </div>
            </div>
        </NavigationMenu>
    );
};