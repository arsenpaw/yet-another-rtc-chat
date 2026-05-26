import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import App from "./App.tsx";
import { Auth0Provider } from "@auth0/auth0-react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0Provider
        domain="dev-rtc-identity.eu.auth0.com"
        clientId="QiYk2G0UHh7NrORUCqfY7BlUAc49oWSr"
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: "https://dev-rtc-identity.eu.auth0.com/api/v2/"
        }}
      >
        <App />
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          theme="dark"
        />
      </Auth0Provider>
    </BrowserRouter>
  </StrictMode>,
);
