/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hot reload inside docker: the compose bind mount (./client:/app) crosses
  // the Docker Desktop VM boundary, where file-system events from the host
  // never reach the container. Turbopack's default watcher is event-based
  // (inotify), so it sees nothing — edits only applied after a container
  // restart. This switches the dev watcher to stat-polling every 500ms.
  // Only affects `next dev`; `next build` never watches.
  watchOptions: { pollIntervalMs: 500 },
};

export default nextConfig;
