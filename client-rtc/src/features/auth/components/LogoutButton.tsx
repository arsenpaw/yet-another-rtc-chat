import { Button } from "@/shared/components/ui";
import { useAuth0 } from "@auth0/auth0-react";
import { LogOut } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export const LogoutButton = ({ className }: { className?: string }) => {
    const { logout } = useAuth0();
    return (
        <Button variant="link" size="lg" className={cn("text-red-500 flex items-center justify-start hover:text-red-800", className)} onClick={() => logout()}>
            <LogOut />
            <span>Logout</span>
        </Button>
    )
}