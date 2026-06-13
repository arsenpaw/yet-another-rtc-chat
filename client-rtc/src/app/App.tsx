import { Route, Routes } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { HomePage } from "@/pages/home";
import { RoomsPage } from "@/pages/rooms";
import { RoomCallPage } from "@/pages/room";
import { ProtectedRoute } from "@/features/auth";
import { useAuth0 } from "@auth0/auth0-react";

function App() {
  const { isLoading, error } = useAuth0();

  if (isLoading) return <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
  </div>

  if (error) return <div className="flex items-center justify-center h-screen">
    <div className="text-2xl text-destructive">Error: {error.message}</div>
  </div>

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:roomId" element={<RoomCallPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
