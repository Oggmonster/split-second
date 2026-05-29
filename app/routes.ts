import { route, type RouteConfig } from "@react-router/dev/routes";

export default [
  route("/", "routes/_index.tsx"),
  route("/play", "routes/play.tsx"),
  route("/history", "routes/history.tsx"),
  route("/settings", "routes/settings.tsx"),
] satisfies RouteConfig;
