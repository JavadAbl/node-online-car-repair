// seed.service.ts
// Idempotent bootstrap admin, driven by SEED_ADMIN_MOBILE (see .env.example).
//
// Chicken-and-egg problem this solves: granting roles requires an Admin
// (every route is permission-guarded), but the first real user only ever
// gets created through OTP login — with the default role NewUser and no
// grants. So the very first login can never bootstrap an Admin organically.
//
// Semantics (run once at boot, safe to repeat on every restart):
//   - SEED_ADMIN_MOBILE unset/empty  -> seed disabled, nothing happens
//   - user does not exist            -> create it with role=Admin AND publish
//                                       the same auth.api-user.create event a
//                                       first organic login would (replicates
//                                       the profile into customer-service,
//                                       which fans out to notification)
//   - user exists with another role  -> promote to Admin (self-heals the
//                                       "already logged in as NewUser" case)
//   - user exists as Admin           -> no-op
//
// The event is published ONLY on create: re-publishing for an already
// replicated user would trip customer-service's mobile-uniqueness check and
// dead-letter the message. Boot-time re-promotion is intentional (removing
// the env var stops it — see .env.example) and matches the claims-staleness
// model: a demotion/promotion reaches the user's token at their next refresh.

import { config } from "../infrastructure/config.js";
import { Role } from "../infrastructure/database/generated/prisma/enums.js";
import { userRepository } from "../infrastructure/database/Repository/user.repository.js";
import { RMQ_P_RK_USER_CREATE } from "../infrastructure/rabbitmq/config/rmq-config.js";
import { rmqPublisher } from "../infrastructure/rabbitmq/rmq.provider.js";

async function seedAdminUser(): Promise<void> {
  const mobile = config.SEED_ADMIN_MOBILE;
  if (!mobile) {
    console.log("[seed] SEED_ADMIN_MOBILE is not set — skipping admin seed");
    return;
  }

  const existing = await userRepository.findUnique({ where: { mobile } });

  if (!existing) {
    const user = await userRepository.create({ data: { mobile, role: Role.Admin } });
    // Mirror getOrCreateUserForLogin's fan-out so a seeded admin is
    // indistinguishable from one created by a first login.
    await rmqPublisher.publish(RMQ_P_RK_USER_CREATE, user);
    console.log(`[seed] created admin user (id=${user.id}, mobile=${mobile})`);
    return;
  }

  if (existing.role !== Role.Admin) {
    await userRepository.update({ where: { id: existing.id }, data: { role: Role.Admin } });
    console.log(`[seed] promoted existing user id=${existing.id} (mobile=${mobile}) to Admin`);
    return;
  }

  console.log(`[seed] admin user already present (id=${existing.id}) — nothing to do`);
}

export const seedService = { seedAdminUser };
