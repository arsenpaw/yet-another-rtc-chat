import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { Avatar, AvatarImage, AvatarFallback, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/shared/components/ui";
import { useAuth0 } from "@auth0/auth0-react";
import { ChevronDown } from "lucide-react";

export const UserAvatar = () => {
    const { user, isAuthenticated } = useAuth0();

    if (!isAuthenticated || !user) return null;

    const initials = user.name?.split(" ").map((n) => n[0]).join("").toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center gap-2 cursor-pointer">
                <Avatar >
                    <AvatarImage src={user.picture} alt={initials} />
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-4 mt-1 min-w-48 shadow-xs">
                <DropdownMenuItem>
                    <LogoutButton className="w-full" />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}