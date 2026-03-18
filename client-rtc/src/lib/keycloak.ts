import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL as string || "http://localhost:8080",
  realm: import.meta.env.VITE_KEYCLOAK_REALM as string || "rtc-chat",
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string || "rtc-chat-client",
});

export default keycloak;
