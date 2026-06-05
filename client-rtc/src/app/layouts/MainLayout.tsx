import { Footer } from "@/widgets/footer/components/Footer"
import { Navbar } from "@/widgets/navbar/components"
import { Outlet } from "react-router-dom"

export const MainLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Navbar />
            <main className="flex-1 w-full">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}