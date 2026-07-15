import { Route, Routes } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { AppLayout } from "./layouts/AppLayout";
import { HomePage } from "@/pages/home";
import { RoomsPage } from "@/pages/rooms";
import { RoomCallPage } from "@/pages/room";
import { ProtectedRoute } from "@/features/auth";
import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const { isLoading, error } = useAuth0();

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-background">
    <div className="size-12 animate-spin rounded-full border-2 border-white/10 border-t-primary"></div>
  </div>

  if (error) return <div className="flex h-screen items-center justify-center bg-background">
    <div className="text-xl text-destructive">Error: {error.message}</div>
  </div>

  return (
    <Routes>
      {/* Marketing surface — top nav + footer */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
      </Route>
      {/* Authenticated app surface — full-screen shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:roomId" element={<RoomCallPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
