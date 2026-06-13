import { UserAvatar } from "@/entities/user/components/UserAvatar";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/shared/components/ui";
import { MessagesSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { LoginButton, RegisterButton } from "@/features/auth/components";

export const Navbar = () => {
    const { isAuthenticated } = useAuth0();

    return (
        <NavigationMenu className="sticky top-0 z-50 bg-surface/70 border-b border-border w-full max-w-full backdrop-blur-md supports-[backdrop-filter]:bg-surface/60">
            <div className="flex items-center w-full px-6 py-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <Link to="/" className="rounded-full bg-primary p-2 shadow-sm transition-transform duration-300 hover:scale-110 hover:rotate-6">
                            <MessagesSquare size={16} className="text-primary-foreground" />
                        </Link >
                        <Link to="/" className="text-2xl text-primary font-semibold font-display tracking-tight transition-opacity hover:opacity-80">
                            Yet Another RTC Chat
                        </Link>
                    </div>
                </div>

                <NavigationMenuList className="flex items-center gap-1">
                    {isAuthenticated && (
                        <div className="flex items-center gap-4">
                            <NavigationMenuItem>
                                <Link to="/rooms" className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-primary after:transition-all after:duration-300 hover:after:w-full">Rooms</Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <Link to="/profile" className="relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-primary after:transition-all after:duration-300 hover:after:w-full">Profile</Link>
                            </NavigationMenuItem>
                        </div>
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