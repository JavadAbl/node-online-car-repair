/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hot reload inside docker: the compose bind mount (./client:/app) crosses
  // the Docker Desktop VM boundary, where file-system events from the host
  // never reach the container — watchers must stat-poll instead.
  //
  // Why `--webpack` in the dev script: next maps this pollIntervalMs to
  // webpack's watchOptions.poll, and watchpack polling is the battle-tested
  // docker path. Turbopack's own pollIntervalMs is broken on next 16.1.6 —
  // it switches the native watcher to poll mode (you'll see "watch error
  // ... NotFound" spam) but never fires change events, so edits still
  // needed a container restart (cf. vercel/next.js#80665 / #68255;
  // verified empirically: poll mode serves stale pages even 7s after an
  // edit, webpack+poll picks it up in <1s). Turbopack still works fine for
  // native (non-docker) dev via `npm run dev:turbopack`, and `next build`
  // is unaffected. Only affects `next dev`; builds never watch.
  watchOptions: { pollIntervalMs: 500 },
};

export default nextConfig;
