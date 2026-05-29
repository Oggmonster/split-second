import {
  isRouteErrorResponse,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root";
import "./styles/app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div className="app-shell">
          <header className="topbar">
            <NavLink to="/" className="brand" aria-label="Split Second home">
              <span className="brand-mark">SS</span>
              <span>Split Second</span>
            </NavLink>
            <nav className="nav-links" aria-label="Primary">
              <NavLink to="/play">Play</NavLink>
              <NavLink to="/history">History</NavLink>
              <NavLink to="/settings">Settings</NavLink>
            </nav>
          </header>
          {children}
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Something clipped a hurdle.";
  let details = "Try refreshing the page and taking another run.";

  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`;
    details = error.data;
  } else if (error instanceof Error) {
    details = error.message;
  }

  return (
    <main className="page narrow-page">
      <h1>{message}</h1>
      <p>{details}</p>
    </main>
  );
}
