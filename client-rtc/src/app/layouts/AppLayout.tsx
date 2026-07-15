import { Outlet } from "react-router-dom";

/**
 * Full-screen shell for the authenticated app (rooms browse + room call).
 * No marketing chrome — each page renders its own icon-rail layout.
 */
export const AppLayout = () => {
    return (
        <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
            <Outlet />
        </div>
    );
};
