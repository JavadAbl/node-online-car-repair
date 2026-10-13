"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  KeySquare,
  Save,
  Search,
  ShieldCheck,
  Undo2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoadingButton } from "@/components/shared/buttons/loading-button";
import {
  useGetPermissionReferencesQuery,
  useGetRolePermissionsQuery,
  useGetRolesQuery,
  useGetUserPermissionsQuery,
  useGetUsersQuery,
  useSetUserRoleMutation,
  useSyncUserPermissionsMutation,
} from "@/lib/features/auth/permissions-api";
import {
  ancestorsOf,
  buildTree,
  prettify,
  shortName,
  type ServiceNode,
} from "@/lib/features/auth/permission-tree";
import type { UserAccountDto } from "@/lib/features/auth/permissions-types";
import { cn } from "@/lib/shared/utils";

/** The server's default page size for the user listing. */
const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Source-aware grant state (role vs personal)
// ---------------------------------------------------------------------------

/**
 * One permission row can be in exactly one of four states:
 *
 *   role      — covered (directly or via an ancestor) by the user's ROLE
 *               grants. Locked here; managed on the Roles & Permissions screen.
 *   user      — a direct personal grant of this user. Editable here.
 *   inherited — covered by a broader PERSONAL grant (an ancestor). Locked here;
 *               uncheck the ancestor instead.
 *   none      — not granted at all. Editable here.
 */
type RowState = "role" | "user" | "inherited" | "none";

// ---------------------------------------------------------------------------
// Manager
// ---------------------------------------------------------------------------

export default function UserPermissionsManager() {
  // Listing state --------------------------------------------------------------
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Debounce the search box; every committed search restarts at page 1.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);
  useEffect(() => {
    setPage(1);
  }, [search]);

  // Queries --------------------------------------------------------------------
  const { data: references, isLoading: isLoadingReferences } =
    useGetPermissionReferencesQuery();
  const { data: roles } = useGetRolesQuery();
  const { data: users, isLoading: isLoadingUsers, isFetching } = useGetUsersQuery({
    page,
    search: search || undefined,
  });

  // The selected row is re-derived from the (refetching) listing so it stays
  // fresh after a role change — that is what drives the role-coverage view.
  const selectedUser = useMemo(
    () => users?.find((user) => user.id === selectedId) ?? null,
    [users, selectedId],
  );

  const { data: rolePermissions, isLoading: isLoadingRoleGrants } =
    useGetRolePermissionsQuery(selectedUser?.role ?? "", {
      skip: !selectedUser,
    });
  const { data: userPermissions, isLoading: isLoadingUserGrants } =
    useGetUserPermissionsQuery(selectedUser?.id ?? 0, {
      skip: !selectedUser,
    });

  const [syncUserPermissions, { isLoading: isSaving }] =
    useSyncUserPermissionsMutation();
  const [setUserRole, { isLoading: isSettingRole }] = useSetUserRoleMutation();

  // Working copy of the personal grants (in-progress edits) ----------------------
  const roleGrants = useMemo(
    () => new Set((rolePermissions ?? []).map((row) => row.permissionName)),
    [rolePermissions],
  );
  const serverGrants = useMemo(
    () => new Set((userPermissions ?? []).map((row) => row.name)),
    [userPermissions],
  );
  const [grants, setGrants] = useState<Set<string>>(new Set());

  // Server truth always wins whenever a fresh list arrives (user switch / save).
  useEffect(() => {
    setGrants(new Set(serverGrants));
  }, [serverGrants]);

  const tree = useMemo(() => buildTree(references ?? []), [references]);

  // Hierarchy semantics (union of role grants and personal grants) --------------
  const coveredByRole = (name: string) =>
    ancestorsOf(name).some((ancestor) => roleGrants.has(ancestor));
  const fromRole = (name: string) => roleGrants.has(name) || coveredByRole(name);

  const coveredByUserGrant = (name: string) =>
    ancestorsOf(name).some((ancestor) => grants.has(ancestor));

  const describe = (name: string): { state: RowState; checked: boolean } => {
    if (fromRole(name)) return { state: "role", checked: true };
    if (grants.has(name)) return { state: "user", checked: true };
    if (coveredByUserGrant(name)) return { state: "inherited", checked: true };
    return { state: "none", checked: false };
  };

  const isDirty = useMemo(() => {
    if (grants.size !== serverGrants.size) return true;
    for (const name of grants) if (!serverGrants.has(name)) return true;
    return false;
  }, [grants, serverGrants]);

  const isReadOnly = selectedUser?.role === "Admin";

  // Handlers ---------------------------------------------------------------------
  const handleToggle = (name: string) => {
    if (isReadOnly) return;
    const state = describe(name).state;
    if (state === "role" || state === "inherited") return;
    setGrants((previous) => {
      const next = new Set(previous);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    await syncUserPermissions({
      userId: selectedUser.id,
      permissionNames: [...grants],
    });
  };

  const handleReset = () => setGrants(new Set(serverGrants));

  const handleRoleChange = async (role: string) => {
    if (!selectedUser || role === selectedUser.role) return;
    try {
      await setUserRole({ userId: selectedUser.id, role }).unwrap();
      toast.success(
        `Role set to ${prettify(role)}. Its grants apply to this user at their next token refresh.`,
      );
    } catch {
      // Non-401 failures are already toasted by the base query.
    }
  };

  // ---------------------------------------------------------------------
  // View: the listing (no user selected)
  // ---------------------------------------------------------------------
  if (selectedId === null) {
    return (
      <UserTable
        users={users}
        isLoading={isLoadingUsers || isLoadingReferences}
        isFetching={isFetching}
        page={page}
        searchInput={searchInput}
        onSearchInput={setSearchInput}
        onPick={setSelectedId}
        onSetPage={setPage}
      />
    );
  }

  // ---------------------------------------------------------------------
  // View: the manager (one user selected)
  // ---------------------------------------------------------------------
  const isLoadingBootstrap = isLoadingReferences || (isLoadingUsers && !users);
  if (isLoadingBootstrap || !selectedUser) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!tree.length) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        No permissions available yet. Services publish their permission
        registries on startup — make sure the services are running.
      </div>
    );
  }

  const isLoadingGrants = isLoadingRoleGrants || isLoadingUserGrants;

  return (
    <div className="space-y-4 p-6">
      {/* Header: back + identity + role */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <LoadingButton
            variant="ghost"
            size="sm"
            disabled={isSaving}
            onClick={() => setSelectedId(null)}
          >
            <ArrowLeft className="h-4 w-4" />
            Users
          </LoadingButton>
          <div className="text-sm">
            <span className="font-medium">{selectedUser.mobile}</span>
            <span className="text-muted-foreground"> · User #{selectedUser.id}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Role</span>
          <Select
            value={selectedUser.role}
            onValueChange={handleRoleChange}
            disabled={isSettingRole || isSaving}
          >
            <SelectTrigger size="sm" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(roles ?? []).map((role) => (
                <SelectItem key={role} value={role}>
                  {prettify(role)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isReadOnly && (
        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Admin always has access</AlertTitle>
          <AlertDescription>
            The Admin role bypasses every permission check by design, so personal
            grants are never evaluated for this user. This panel is read-only.
          </AlertDescription>
        </Alert>
      )}

      {/* Legend / semantics */}
      <p className="text-sm text-muted-foreground">
        Effective access = this user&apos;s <span className="font-medium">role grants</span>{" "}
        united with their <span className="font-medium">personal grants</span>. Use
        personal grants to give one user access beyond their role; changes reach
        their token at the next refresh (&le; 15 min).
      </p>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Badge variant="outline">from role</Badge>
          <span>locked</span>
          <span>·</span>
          <Badge variant="secondary">user grant</Badge>
          <span>editable</span>
          <span>·</span>
          <Badge variant="outline" className="text-muted-foreground">
            inherited
          </Badge>
          <span>covered by a broader personal grant</span>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && !isReadOnly && <Badge variant="outline">Unsaved changes</Badge>}
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
              describe={describe}
              isReadOnly={isReadOnly}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// The listing: search + table + pager
// ---------------------------------------------------------------------------

function UserTable({
  users,
  isLoading,
  isFetching,
  page,
  searchInput,
  onSearchInput,
  onPick,
  onSetPage,
}: {
  users: UserAccountDto[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  searchInput: string;
  onSearchInput: (value: string) => void;
  onPick: (id: number) => void;
  onSetPage: (page: number) => void;
}) {
  const rows = users ?? [];
  const canPrev = page > 1;
  const canNext = rows.length === PAGE_SIZE; // heuristic: a full page implies more

  return (
    <div className="space-y-4 p-6">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(event) => onSearchInput(event.target.value)}
          placeholder="Search by mobile…"
          className="pl-8"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {searchInput
            ? "No users match this search."
            : "No users yet — a user row appears after their first login."}
        </p>
      ) : (
        <div className={cn("rounded-lg border transition-opacity", isFetching && "opacity-60")}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Id</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead className="w-32">Role</TableHead>
                <TableHead className="w-44 text-right">Personal grants</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer"
                  onClick={() => onPick(user.id)}
                >
                  <TableCell className="text-muted-foreground">{user.id}</TableCell>
                  <TableCell className="font-medium">{user.mobile}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "Admin" ? "default" : "secondary"}>
                      {prettify(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <LoadingButton
                      variant="outline"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        onPick(user.id);
                      }}
                    >
                      <KeySquare className="h-4 w-4" />
                      Manage
                    </LoadingButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pager */}
      {rows.length > 0 && (
        <div className="flex items-center justify-center gap-2">
          <LoadingButton
            variant="outline"
            size="sm"
            disabled={!canPrev || isFetching}
            onClick={() => onSetPage(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </LoadingButton>
          <span className="px-2 text-sm text-muted-foreground">Page {page}</span>
          <LoadingButton
            variant="outline"
            size="sm"
            disabled={!canNext || isFetching}
            onClick={() => onSetPage(page + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </LoadingButton>
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
  describe,
  isReadOnly,
  onToggle,
}: {
  service: ServiceNode;
  describe: (name: string) => { state: RowState; checked: boolean };
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

  const effectiveCount = allNames.filter((name) => describe(name).checked).length;
  const total = allNames.length;

  return (
    <div className="rounded-lg border">
      <div className="flex items-center gap-3 px-4 py-3">
        <GrantCheckbox
          name={service.name}
          describe={describe}
          isReadOnly={isReadOnly}
          onToggle={onToggle}
          ariaLabel={`Grant entire ${service.name} service`}
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
                <GrantRow
                  name={controller.name}
                  label={shortName(controller.name)}
                  isController
                  describe={describe}
                  isReadOnly={isReadOnly}
                  onToggle={onToggle}
                />
                <div className="ml-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {controller.actions.map((action) => (
                    <GrantRow
                      key={action}
                      name={action}
                      label={shortName(action)}
                      describe={describe}
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
// Grant checkboxes
// ---------------------------------------------------------------------------

/** The bare service-level checkbox (no label row). */
function GrantCheckbox({
  name,
  describe,
  isReadOnly,
  onToggle,
  ariaLabel,
}: {
  name: string;
  describe: (name: string) => { state: RowState; checked: boolean };
  isReadOnly: boolean;
  onToggle: (name: string) => void;
  ariaLabel: string;
}) {
  const { state, checked } = describe(name);
  const locked = isReadOnly || state === "role" || state === "inherited";

  return (
    <Checkbox
      checked={checked}
      disabled={locked}
      onCheckedChange={() => onToggle(name)}
      aria-label={ariaLabel}
    />
  );
}

/** A labeled row (controller or action) with its source badge. */
function GrantRow({
  name,
  label,
  isController = false,
  describe,
  isReadOnly,
  onToggle,
}: {
  name: string;
  label: string;
  isController?: boolean;
  describe: (name: string) => { state: RowState; checked: boolean };
  isReadOnly: boolean;
  onToggle: (name: string) => void;
}) {
  const { state, checked } = describe(name);
  const locked = isReadOnly || state === "role" || state === "inherited";

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition-colors",
        "hover:bg-accent/50",
        isController && "bg-muted/40 font-medium",
        (state === "inherited" || (state === "role" && !isController)) &&
          "text-muted-foreground",
      )}
      title={name}
    >
      <Checkbox
        checked={checked}
        disabled={locked}
        onCheckedChange={() => onToggle(name)}
      />
      <span className="truncate">{label}</span>
      {state === "role" && (
        <Badge variant="outline" className="ml-auto shrink-0">
          from role
        </Badge>
      )}
      {state === "user" && (
        <Badge variant="secondary" className="ml-auto shrink-0">
          user grant
        </Badge>
      )}
      {state === "inherited" && (
        <Badge variant="outline" className="ml-auto shrink-0">
          inherited
        </Badge>
      )}
    </label>
  );
}
