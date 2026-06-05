import { UserAvatar } from "@/entities/user/components/UserAvatar";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/shared/components/ui";
import { MessagesSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { LoginButton, RegisterButton } from "@/features/auth/components";

export const Navbar = () => {
    const { isAuthenticated } = useAuth0();

    return (
        <header className="w-full border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <NavigationMenu className="w-full max-w-full justify-start h-16"> {/* h-16 задасть фіксовану висоту */}
                <div className="flex items-center w-full px-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <Link to="/" className="rounded-full bg-primary p-2">
                                <MessagesSquare size={16} className="text-secondary" />
                            </Link >
                            <Link to="/" className="text-2xl text-primary font-semibold font-serif tracking-tight">
                                Yet Another RTC Chat
                            </Link>
                        </div>
                    </div>

                    <NavigationMenuList className="flex items-center gap-1">
                        {isAuthenticated && (
                            <div className="flex items-center gap-4">
                                <NavigationMenuItem>
                                    <Link to="/rooms" className="text-sm font-medium text-muted-foreground hover:text-foreground">Rooms</Link>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <Link to="/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground">Profile</Link>
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
        </header>
    );
};