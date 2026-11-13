/// <reference lib="webworker" />
import {
  cleanupOutdatedCaches,
  precacheAndRoute,
  createHandlerBoundToURL,
} from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: import("workbox-precaching").PrecacheEntry[];
};
// Sirf app shell cache hota hai; weather snapshot alag storage mein rehta hai.
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
registerRoute(new NavigationRoute(createHandlerBoundToURL("/index.html")));
self.addEventListener("install", () => {
  void self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const client = clients.find(
        (c) => new URL(c.url).origin === self.location.origin,
      );
      if (client) await client.focus();
      else await self.clients.openWindow("/");
    })(),
  );
});
