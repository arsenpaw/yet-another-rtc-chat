import { Footer } from "@/widgets/footer/components/Footer"
import { Navbar } from "@/widgets/navbar/components"
import { Outlet } from "react-router-dom"

export const MainLayout = () => {
    return (
        <div className="flex flex-col gap-24 min-h-screen bg-background">
            <Navbar />
            <main className="flex flex-col items-center gap-24 mx-auto">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}