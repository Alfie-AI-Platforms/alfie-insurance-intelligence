import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/underwriting")({ component: () => <Outlet /> });
