"use client";

import { ContainerCard } from "@/components/shared/cards/container-card";
import RolePermissionsManager from "./components/role-permissions-manager";

export default function RolesPage() {
  return (
    <ContainerCard
      className="w-full"
      title="Roles & Permissions"
      description="Assign permission grants per role. Changes apply to users at their next token refresh, or immediately through each service's local mirror."
    >
      <RolePermissionsManager />
    </ContainerCard>
  );
}
