
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
| http://localhost/auth-api/... (also customer/factor/vehicle/product/notification-api) | Gateway → microservices |
| http://localhost/api-docs/auth-api/swagger.json | Swagger specs (raw JSON) |
| http://localhost:15672 | RabbitMQ management (app_user / app_password) |
| http://localhost:8082 | phpMyAdmin |
| http://localhost:8083 | Dozzle (container logs) |

Notes:

* The client container runs `next dev` with hot reload (source is bind-mounted; `node_modules` lives in the `client_node_modules` named volume and is installed on first boot).
* The browser-facing API address is injected as `NEXT_PUBLIC_API_BASE_URL=http://localhost/` in `compose.yaml`; a local `client/.env` cannot override it inside the container.
* The stack intentionally serves plain **HTTP** for development; the 443 port mapping is left in place for a future TLS setup.
