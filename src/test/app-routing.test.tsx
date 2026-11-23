import { QueryClient } from "@tanstack/react-query";
import { createMemoryHistory, createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// The route tree is a TanStack Start tree whose root renders an <html>
// shell, which a jsdom container cannot paint. So assert at the routing
// level instead: the router loads, resolves the index route for a known
// path, and falls back to the root not-found match for an unknown one.
// Page content is never asserted: routes are rewritten as the app is
// built and this must keep passing.
async function loadAt(path: string) {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  await router.load();
  return router;
}

describe("App routing", () => {
  it("resolves the index route", async () => {
    const router = await loadAt("/");

    expect(router.state.status).toBe("idle");
    expect(router.state.matches.map((m) => m.routeId)).toEqual(["__root__", "/"]);
  });

  it("resolves the not-found route", async () => {
    const router = await loadAt("/this-route-does-not-exist");

    expect(router.state.status).toBe("idle");
    expect(router.state.matches.map((m) => m.routeId)).toEqual(["__root__"]);
  });
});
