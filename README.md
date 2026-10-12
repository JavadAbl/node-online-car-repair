
میکروسرویس فول‌استک ارائه خدمات آنلاین تعمیر و نگهداری خودرو.

#### بک‌اند

* طراحی و پیاده‌سازی **معماری میکروسرویس** با استفاده از **NestJS**، **Express.js** و **Fastify**.
* پیاده‌سازی ارتباط غیرهمزمان بین سرویس‌ها با استفاده از **RabbitMQ** و **Redis**.
* توسعه فرآیندهای مبتنی بر رویداد (Event-Driven) و پردازش وظایف پس‌زمینه با استفاده از **Queue Jobs** و **Cron Jobs**.
* استفاده از **Prisma ORM** به‌عنوان لایه دسترسی به داده و انتزاع پایگاه داده.
* توسعه سرویس‌های مقیاس‌پذیر و قابل نگهداری بر اساس اصل تفکیک مسئولیت‌ها (Separation of Concerns).

#### فرانت‌اند

* توسعه رابط کاربری مدرن با استفاده از **Next.js**.
* طراحی کامپوننت‌های قابل استفاده مجدد و واکنش‌گرا با **Shadcn/UI**.
* پیاده‌سازی مدیریت و اعتبارسنجی فرم‌ها با **React Hook Form**.
* مدیریت ارتباط با API، کشینگ و وضعیت داده‌ها با استفاده از **RTK Query**.

#### فناوری‌ها

NestJS، Express.js، Fastify، Next.js، React، TypeScript، RabbitMQ، Redis، Prisma ORM، MySQL، RTK Query، React Hook Form، Shadcn/UI

---

## Online Car Repair Application


Full-stack platform for providing online automobile repair and maintenance services.

#### Backend

* Designed and implemented a **Microservices Architecture** using **NestJS**, **Express.js**, and **Fastify**.
* Established asynchronous communication between services using **RabbitMQ** and **Redis**.
* Implemented event-driven workflows and background task processing with **Queue Jobs** and **Cron Jobs**.
* Utilized **Prisma ORM** as the data access layer and database abstraction.
* Built scalable and maintainable services following separation of concerns principles.

#### Frontend

* Developed a modern web application using **Next.js**.
* Built responsive and reusable UI components with **Shadcn/UI**.
* Implemented form management and validation using **React Hook Form**.
* Managed API communication, caching, and remote state using **RTK Query**.

#### Technologies

NestJS, Express.js, Fastify, Next.js, React, TypeScript, RabbitMQ, Redis, Prisma ORM, MySQL, RTK Query, React Hook Form, Shadcn/UI

---

## Running with Docker Compose

```bash
docker compose up --build
```

Nginx is the single public entry point on port **80**: it routes the microservice API prefixes to the gateway and everything else to the Next.js client, so the browser talks to one origin (no CORS).

| URL | What |
| --- | --- |
| http://localhost | Next.js client |
| http://localhost/auth-api/... (also customer/factor/vehicle/product/notification-api) | Gateway -> microservices |
| http://localhost/api-docs/auth-api/swagger.json | Swagger specs (raw JSON) |
| http://localhost:15672 | RabbitMQ management (app_user / app_password) |
| http://localhost:8082 | phpMyAdmin |
| http://localhost:8083 | Dozzle (container logs) |

Development notes:

* All Node containers (services + client) keep `node_modules` in per-service named volumes (`<service>_node_modules`) — installed once on first boot by Linux npm inside the container, surviving rebuilds and `up`/`down`. Host (e.g. Windows) `node_modules` never leak into the Linux containers, and bind-mounted source keeps hot reload working.
* After editing a service's `package.json`, run `docker compose up -d --build <service>` so the image picks it up; the boot `npm install` then syncs the volume. To reset one service's dependencies: `docker volume rm node-microservice-ecommerce_<service>_node_modules` (careful: `docker compose down -v` also deletes `mysql_data`/`rabbitmq_data`).
* The browser-facing API address is injected as `NEXT_PUBLIC_API_BASE_URL=/` (same-origin relative) in `compose.yaml`; a local `client/.env` cannot override it inside the container.
* The dev stack intentionally serves plain **HTTP**.

### Production

```bash
docker compose -f "compose prod.yaml" up -d --build
```

Every service builds from its `Dockerfile.prod`: a multi-stage image that installs dependencies, generates the Prisma client, compiles TypeScript (`tsc` / `nest build` / `next build`), prunes dev dependencies, and runs the compiled output as the non-root `node` user — no bind mounts, no dev servers, no dev utilities (phpMyAdmin/Dozzle are dev-only).

Before the first prod `up`:

1. Create the gitignored `services/*/.env.docker` files (real secrets — structure documented in `services/*/.env.example`).
2. Optionally set infra credentials via a root `.env` or shell: `MYSQL_ROOT_PASSWORD`, `REDIS_PASSWORD`, `RABBITMQ_USER`, `RABBITMQ_PASS` (defaults match the dev stack so it boots as-is).

Production notes:

* The prod project is named `node-microservice-ecommerce-prod`, so it can coexist with the dev stack on the same host (separate volumes/networks).
* The client is built with a RELATIVE API base (`NEXT_PUBLIC_API_BASE_URL=/`): nginx is the single origin and TLS terminates at the edge in front of it, so the same client image works on any domain — changing the domain later requires NO rebuild. (Pass the build arg only for split-origin deployments, where the API lives on a different origin than the pages.)
* Services sync their schema at boot with `prisma db push --accept-data-loss` (the repo has no committed migrations yet). For real production data, adopt `prisma migrate` and switch the boot command to `prisma migrate deploy`.
* HTTPS: TLS terminates at the edge (cloud load balancer / host nginx / Caddy) which forwards to the stack's nginx over plain HTTP; the containers themselves stay HTTP-only behind it.
