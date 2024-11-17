import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";

const client = new ApolloClient({
  uri: "https://epresence-server.shuttleapp.rs/gql",
  // uri: "http://localhost:8000/gql",
  cache: new InMemoryCache(),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="epresence-theme">
      <ApolloProvider client={client}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApolloProvider>
    </ThemeProvider>
  </StrictMode>,
);
