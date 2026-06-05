import { Navbar } from "@/widgets/navbar/components"
import { Outlet } from "react-router-dom"

export const MainLayoutNoFooter = () => {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    )
}