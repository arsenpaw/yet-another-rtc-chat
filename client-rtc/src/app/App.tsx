import { Route, Routes } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { HomePage } from "@/pages/home";
import { RoomsPage } from "@/pages/rooms";
import { RoomCallPage } from "@/pages/room";
import { ProtectedRoute } from "@/features/auth";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { MainLayoutNoFooter } from "./layouts/MainLayoutNoFooter";

function App() {
  const { isLoading, error } = useAuth0();

  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  useEffect(() => {
    const syncToken = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          localStorage.setItem('access_token', token);
        } catch (error) {
          console.error("Failed to sync token", error);
        }
      } else if (!isLoading) {
        localStorage.removeItem('access_token');
      }
    };

    syncToken();
  }, [isAuthenticated, getAccessTokenSilently, isLoading]);

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
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayoutNoFooter />}>
          <Route path="/rooms" element={<RoomsPage />} />
        </Route>
        <Route path="/room/:id" element={<RoomCallPage />} />
      </Route>
    </Routes>
  );
}

export default App;
