"use client";

import type * as React from "react";
import { Fragment, useMemo } from "react";
import { Lock } from "lucide-react";
import { useControllable } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/ui/button";
import { Checkbox } from "@/registry/ui/checkbox";

export interface PermissionRole {
  id: string;
  name: string;
  /** Gets every permission of this role too, shown as locked ticks. */
  inherits?: string;
}

export interface Permission {
  id: string;
  label: string;
  description?: string;
  /** Roles that can never have this permission (shown locked and empty). */
  disabledFor?: string[];
}

export interface PermissionGroup {
  id: string;
  label: string;
  permissions: Permission[];
}

/** Granted permission ids per role id (only direct grants; inheritance is worked out). */
export type PermissionGrants = Record<string, string[]>;

export interface PermissionsMatrixProps {
  roles: PermissionRole[];
  groups: PermissionGroup[];
  /** Controlled grants. */
  value?: PermissionGrants;
  /** Initial grants when uncontrolled. */
  defaultValue?: PermissionGrants;
  /** Called on every change. */
  onValueChange?: (value: PermissionGrants) => void;
  /** The saved state, to count and show unsaved changes. */
  saved?: PermissionGrants;
  /** Called by Save with the current grants. */
  onSave?: (value: PermissionGrants) => void;
  /** Called by Discard; usually resets `value` to `saved`. */
  onDiscard?: () => void;
  /** Extra classes for the root element. */
  className?: string;
}

/** Every permission a role ends up with, including inherited ones. */
export function effectivePermissions(roleId: string, roles: PermissionRole[], grants: PermissionGrants, seen = new Set<string>()): Set<string> {
  if (seen.has(roleId)) return new Set();
  seen.add(roleId);
  const role = roles.find((r) => r.id === roleId);
  const own = new Set(grants[roleId] ?? []);
  if (role?.inherits) for (const p of effectivePermissions(role.inherits, roles, grants, seen)) own.add(p);
  return own;
}

const key = (g: PermissionGrants) => JSON.stringify(Object.fromEntries(Object.entries(g).map(([k, v]) => [k, [...v].sort()]).sort()));

/**
 * Role × permission grid for admin screens: grouped permissions, role inheritance shown as
 * locked ticks, permissions a role can never have, group-level toggles and an unsaved
 * changes bar.
 */
export function PermissionsMatrix({ roles, groups, value, defaultValue = {}, onValueChange, saved, onSave, onDiscard, className }: PermissionsMatrixProps) {
  const [grants, setGrants] = useControllable({ value, defaultValue, onChange: onValueChange });
  const effective = useMemo(() => Object.fromEntries(roles.map((r) => [r.id, effectivePermissions(r.id, roles, grants)])), [roles, grants]);
  const inheritedFrom = (role: PermissionRole, perm: string): string | null => {
    let parent = roles.find((r) => r.id === role.inherits);
    while (parent) {
      if ((grants[parent.id] ?? []).includes(perm)) return parent.name;
      parent = roles.find((r) => r.id === parent?.inherits);
    }
    return null;
  };
  const changes = useMemo(() => {
    if (!saved) return 0;
    let n = 0;
    for (const r of roles) {
      const a = new Set(saved[r.id] ?? []);
      const b = new Set(grants[r.id] ?? []);
      for (const p of a) if (!b.has(p)) n++;
      for (const p of b) if (!a.has(p)) n++;
    }
    return n;
  }, [saved, grants, roles]);

  const toggle = (roleId: string, perms: string[], on: boolean) => {
    const current = new Set(grants[roleId] ?? []);
    for (const p of perms) on ? current.add(p) : current.delete(p);
    setGrants({ ...grants, [roleId]: [...current] });
  };
  const editable = (role: PermissionRole, p: Permission) => !p.disabledFor?.includes(role.id) && !inheritedFrom(role, p.id);

  return (
    <div className={cn("grid gap-3", className)}>
      <div className="overflow-x-auto rounded-xl border scrollbar-thin">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead className="bg-muted/50 text-xs text-muted-foreground">
            <tr>
              <th scope="col" className="border-b px-4 py-2.5 text-left font-medium">
                Permission
              </th>
              {roles.map((r) => (
                <th key={r.id} scope="col" className="w-28 border-b px-2 py-2.5 text-center font-medium">
                  <span className="block text-foreground">{r.name}</span>
                  {r.inherits && <span className="block font-normal">+ {roles.find((x) => x.id === r.inherits)?.name}</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => {
              const ids = g.permissions.map((p) => p.id);
              return (
                <Fragment key={g.id}>
                  <tr className="bg-muted/20">
                    <th scope="rowgroup" className="border-b px-4 py-2 text-left text-xs font-semibold">
                      {g.label}
                    </th>
                    {roles.map((r) => {
                      const editableIds = g.permissions.filter((p) => editable(r, p)).map((p) => p.id);
                      const has = editableIds.filter((id) => (grants[r.id] ?? []).includes(id)).length;
                      return (
                        <td key={r.id} className="border-b px-2 py-2">
                          {editableIds.length > 0 && (
                            <Checkbox
                              aria-label={`All ${g.label} permissions for ${r.name}`}
                              className="justify-center"
                              checked={has === 0 ? false : has === editableIds.length ? true : "indeterminate"}
                              onCheckedChange={() => toggle(r.id, editableIds, has !== editableIds.length)}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  {g.permissions.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-accent/30">
                      <th scope="row" className="px-4 py-2.5 text-left font-normal">
                        <span className="block">{p.label}</span>
                        {p.description && <span className="block text-xs text-muted-foreground">{p.description}</span>}
                      </th>
                      {roles.map((r) => {
                        const blocked = p.disabledFor?.includes(r.id);
                        const via = inheritedFrom(r, p.id);
                        const on = effective[r.id].has(p.id);
                        const savedOn = saved ? (saved[r.id] ?? []).includes(p.id) : on;
                        const own = (grants[r.id] ?? []).includes(p.id);
                        return (
                          <td key={r.id} className={cn("px-2 py-2.5 text-center", saved && own !== savedOn && "bg-warning/10")}>
                            {blocked ? (
                              <span title={`${r.name} can't have this permission`} className="inline-grid size-[18px] place-items-center text-muted-foreground/60">
                                <Lock className="size-3.5" aria-label={`Not available for ${r.name}`} />
                              </span>
                            ) : via ? (
                              <span title={`Inherited from ${via}`} className="inline-flex">
                                <Checkbox aria-label={`${p.label} for ${r.name}, inherited from ${via}`} checked disabled className="justify-center opacity-60" />
                              </span>
                            ) : (
                              <Checkbox aria-label={`${p.label} for ${r.name}`} className="justify-center" checked={on} onCheckedChange={(c) => toggle(r.id, [p.id], c === true)} />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-primary opacity-60" aria-hidden /> Inherited
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Lock className="size-3" aria-hidden /> Not available
          </span>
        </span>
        {saved && (
          <span className="flex items-center gap-2">
            <span role="status" className={cn("text-sm", changes ? "text-foreground" : "text-muted-foreground")}>
              {changes ? `${changes} unsaved ${changes === 1 ? "change" : "changes"}` : "All changes saved"}
            </span>
            <Button variant="ghost" size="sm" disabled={!changes} onClick={onDiscard}>
              Discard
            </Button>
            <Button size="sm" disabled={!changes} onClick={() => onSave?.(grants)}>
              Save
            </Button>
          </span>
        )}
      </div>
    </div>
  );
}

export const grantsEqual = (a: PermissionGrants, b: PermissionGrants) => key(a) === key(b);
