"use client";

import { ContainerCard } from "@/components/shared/cards/container-card";
import UserPermissionsManager from "./components/user-permissions-manager";

export default function UsersPage() {
  return (
    <ContainerCard
      className="w-full"
      title="Users & Permissions"
      description="Search users, change their role, and grant permissions to a single user beyond what their role provides."
    >
      <UserPermissionsManager />
    </ContainerCard>
  );
}
