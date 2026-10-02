"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Save, ShieldCheck, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadingButton } from "@/components/shared/buttons/loading-button";
import {
  useGetPermissionReferencesQuery,
  useGetRolePermissionsQuery,
  useGetRolesQuery,
  useSyncRolePermissionsMutation,
} from "@/lib/features/auth/permissions-api";
import {
  ancestorsOf,
  buildTree,
  prettify,
  shortName,
  type ServiceNode,
} from "@/lib/features/auth/permission-tree";
import { cn } from "@/lib/shared/utils";

// ---------------------------------------------------------------------------
// Manager
// ---------------------------------------------------------------------------

export default function RolePermissionsManager() {
  // Data ---------------------------------------------------------------------
  const { data: roles, isLoading: isLoadingRoles } = useGetRolesQuery();
  const { data: references, isLoading: isLoadingReferences } =
    useGetPermissionReferencesQuery();

  // The Admin role bypasses every permission check, so its tab is read-only.
  const defaultRole = useMemo(
    () => roles?.find((role) => role !== "Admin") ?? roles?.[0] ?? null,
    [roles],
  );
  const [activeRole, setActiveRole] = useState<string | null>(null);
  useEffect(() => {
    if (activeRole === null && defaultRole) setActiveRole(defaultRole);
  }, [activeRole, defaultRole]);

  const { data: rolePermissions, isLoading: isLoadingGrants } =
    useGetRolePermissionsQuery(activeRole ?? "", {
      skip: !activeRole,
    });

  const [syncRolePermissions, { isLoading: isSaving }] =
    useSyncRolePermissionsMutation();

  // Working copy of the granted set (the user's in-progress edits) -----------
  const [grants, setGrants] = useState<Set<string>>(new Set());
  const serverGrants = useMemo(
    () => new Set((rolePermissions ?? []).map((row) => row.permissionName)),
    [rolePermissions],
  );
  // Server truth always wins whenever a fresh list arrives (role switch / save).
  useEffect(() => {
    setGrants(new Set(serverGrants));
  }, [serverGrants]);

  const tree = useMemo(() => buildTree(references ?? []), [references]);

  // Hierarchy semantics -------------------------------------------------------
  const coveringGrant = (name: string): string | undefined =>
    ancestorsOf(name).find((ancestor) => grants.has(ancestor));

  const isChecked = (name: string) =>
    grants.has(name) || coveringGrant(name) !== undefined;
  const isInherited = (name: string) =>
    !grants.has(name) && coveringGrant(name) !== undefined;

  const toggle = (name: string) => {
    setGrants((previous) => {
      const next = new Set(previous);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const isDirty = useMemo(() => {
    if (grants.size !== serverGrants.size) return true;
    for (const name of grants) if (!serverGrants.has(name)) return true;
    return false;
  }, [grants, serverGrants]);

  const isReadOnly = activeRole === "Admin";

  // Handlers ------------------------------------------------------------------
  const handleSave = async () => {
    if (!activeRole) return;
    await syncRolePermissions({
      role: activeRole,
      permissionNames: [...grants],
    });
  };

  const handleReset = () => setGrants(new Set(serverGrants));

  // Loading state ---------------------------------------------------------------
  if (isLoadingRoles || isLoadingReferences) {
    return (
      <div className="space-y-4 p-6">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-24" />
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!roles?.length || !tree.length) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        No roles or permissions available yet. Services publish their permission
        registries on startup — make sure the services are running.
      </div>
    );
  }

  // Render ---------------------------------------------------------------------
  return (
    <div className="space-y-4 p-6">
      {/* Role selector */}
      <Tabs
        value={activeRole ?? undefined}
        onValueChange={setActiveRole}
        className="w-full"
      >
        <TabsList className="flex-wrap">
          {roles.map((role) => (
            <TabsTrigger key={role} value={role}>
              {prettify(role)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isReadOnly && (
        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Admin always has access</AlertTitle>
          <AlertDescription>
            The Admin role bypasses every permission check by design, so its
            grants are never evaluated. This tab is read-only.
          </AlertDescription>
        </Alert>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Granting a <span className="font-medium">service</span> or{" "}
          <span className="font-medium">controller</span> automatically covers
          every action beneath it.
        </p>
        <div className="flex items-center gap-2">
          {isDirty && !isReadOnly && (
            <Badge variant="outline">Unsaved changes</Badge>
          )}
          <LoadingButton
            variant="outline"
            disabled={!isDirty || isSaving || isLoadingGrants || isReadOnly}
            onClick={handleReset}
          >
            <Undo2 className="h-4 w-4" />
            Reset
          </LoadingButton>
          <LoadingButton
            isLoading={isSaving}
            disabled={!isDirty || isReadOnly || isLoadingGrants}
            onClick={handleSave}
          >
            <Save className="h-4 w-4" />
            Save changes
          </LoadingButton>
        </div>
      </div>

      {/* Grants tree */}
      {isLoadingGrants ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {tree.map((service) => (
            <ServiceCard
              key={service.name}
              service={service}
              isChecked={isChecked}
              isInherited={isInherited}
              isReadOnly={isReadOnly}
              onToggle={toggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Service card (collapsible): service checkbox + controller/action rows
// ---------------------------------------------------------------------------

function ServiceCard({
  service,
  isChecked,
  isInherited,
  isReadOnly,
  onToggle,
}: {
  service: ServiceNode;
  isChecked: (name: string) => boolean;
  isInherited: (name: string) => boolean;
  isReadOnly: boolean;
  onToggle: (name: string) => void;
}) {
  const allNames = useMemo(
    () => [
      service.name,
      ...service.controllers.flatMap((controller) => [
        controller.name,
        ...controller.actions,
      ]),
    ],
    [service],
  );

  const effectiveCount = allNames.filter((name) => isChecked(name)).length;
  const total = allNames.length;

  return (
    <div className="rounded-lg border">
      <div className="flex items-center gap-3 px-4 py-3">
        <Checkbox
          checked={isChecked(service.name)}
          disabled={isReadOnly || isInherited(service.name)}
          onCheckedChange={() => onToggle(service.name)}
          aria-label={`Grant entire ${service.name} service`}
        />
        <div className="flex grow items-center gap-2">
          <span className="font-medium">{prettify(service.name)}</span>
          <Badge variant="secondary">
            {effectiveCount}/{total}
          </Badge>
        </div>
      </div>

      <Collapsible defaultOpen className="group/service">
        <CollapsibleTrigger className="flex w-full items-center justify-end gap-1 px-4 pb-2 text-xs text-muted-foreground hover:text-foreground">
          {service.controllers.length} controllers
          <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]/service:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-4 border-t px-4 py-3">
            {service.controllers.map((controller) => (
              <div key={controller.name} className="space-y-2">
                <PermissionRow
                  name={controller.name}
                  label={shortName(controller.name)}
                  isController
                  isChecked={isChecked}
                  isInherited={isInherited}
                  isReadOnly={isReadOnly}
                  onToggle={onToggle}
                />
                <div className="ml-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {controller.actions.map((action) => (
                    <PermissionRow
                      key={action}
                      name={action}
                      label={shortName(action)}
                      isChecked={isChecked}
                      isInherited={isInherited}
                      isReadOnly={isReadOnly}
                      onToggle={onToggle}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// ---------------------------------------------------------------------------
// One checkbox row (controller or action)
// ---------------------------------------------------------------------------

function PermissionRow({
  name,
  label,
  isController = false,
  isChecked,
  isInherited,
  isReadOnly,
  onToggle,
}: {
  name: string;
  label: string;
  isController?: boolean;
  isChecked: (name: string) => boolean;
  isInherited: (name: string) => boolean;
  isReadOnly: boolean;
  onToggle: (name: string) => void;
}) {
  const inherited = isInherited(name);

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition-colors",
        "hover:bg-accent/50",
        isController && "bg-muted/40 font-medium",
        inherited && "text-muted-foreground",
      )}
      title={name}
    >
      <Checkbox
        checked={isChecked(name)}
        disabled={isReadOnly || inherited}
        onCheckedChange={() => onToggle(name)}
      />
      <span className="truncate">{label}</span>
      {inherited && (
        <Badge variant="outline" className="ml-auto shrink-0">
          inherited
        </Badge>
      )}
    </label>
  );
}
