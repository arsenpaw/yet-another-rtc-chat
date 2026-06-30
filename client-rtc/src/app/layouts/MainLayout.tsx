import { Footer } from "@/widgets/footer/components/Footer"
import { Navbar } from "@/widgets/navbar/components"
import { Outlet } from "react-router-dom"

export const MainLayout = () => {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}
