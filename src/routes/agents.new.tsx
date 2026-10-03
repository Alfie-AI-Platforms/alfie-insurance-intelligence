import { createFileRoute } from "@tanstack/react-router";
import { AgentBuilder } from "@/components/agent-builder";

export const Route = createFileRoute("/agents/new")({
  head: () => ({ meta: [{ title: "Create Agent | Alfie Insurance AI" }, { name: "description", content: "Configure a specialized insurance AI agent." }, { property: "og:title", content: "Create Agent | Alfie Insurance AI" }, { property: "og:description", content: "Configure a specialized insurance AI agent." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: () => <AgentBuilder />,
});