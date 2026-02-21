import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNowStrict, isValid, parseISO } from "date-fns";
import { Button } from "@/components/ui/button/Button";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { InputField } from "@/components/ui/form/InputField";
import { SelectField } from "@/components/ui/form/SelectField";
import { useAuthorization } from "@/features/authz/hooks/useAuthorization";
import { getForbiddenMessage } from "@/features/authz/utils/forbidden";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAssignTenantMemberMutation } from "@/features/settings/hooks/useAssignTenantMemberMutation";
import { useDeleteTenantMemberMutation } from "@/features/settings/hooks/useDeleteTenantMemberMutation";
import { useTenantMembersQuery } from "@/features/settings/hooks/useTenantMembersQuery";
import { useUpdateTenantMemberMutation } from "@/features/settings/hooks/useUpdateTenantMemberMutation";
import {
  assignTenantMemberSchema,
  editTenantMemberSchema,
} from "@/features/settings/schemas/settings.schemas";
import type { TenantMember } from "@/features/settings/types/settings.types";
import { StatusBadge } from "@/shared/components/status/StatusBadge";
import { BadgePill } from "@/shared/components/badge/BadgePill";
import { RoleBadge } from "@/shared/components/badge/RoleBadge";
import { RightSideModal } from "@/shared/components/modals/RightSideModal";
import { Card } from "@/shared/components/card/Card";
import { normalizeApiError } from "@/shared/utils/apiErrors";

const roleOptions = [
  { label: "Admin", value: "ADMIN" },
  { label: "Scorer", value: "SCORER" },
  { label: "Viewer", value: "VIEWER" },
];

const statusOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Disabled", value: "DISABLED" },
];

const formatMemberDate = (value: string) => {
  const parsed = parseISO(value);
  if (!isValid(parsed)) return "-";
  return formatDistanceToNowStrict(parsed, { addSuffix: true });
};

const getMemberMutationMessage = (error: unknown) => {
  const normalized = normalizeApiError(error);
  switch (normalized.code) {
    case "user.not_found":
      return "User not found for this email.";
    case "membership.not_found":
      return "Membership not found.";
    case "tenant.owner_membership_protected":
      return "Tenant owner membership cannot be edited or removed.";
    case "auth.forbidden":
      return getForbiddenMessage(error);
    default:
      return normalized.message || "Unable to complete request.";
  }
};

const getValidationIssues = (error: unknown) => {
  const normalized = normalizeApiError(error);
  if (normalized.code !== "validation.failed") return [];
  const rawIssues = (normalized.details as { issues?: unknown })?.issues;
  if (!Array.isArray(rawIssues)) return [];

  const mapped: Array<{ field: string; message: string }> = [];
  rawIssues.forEach((issue) => {
    if (!issue || typeof issue !== "object") return;
    const message =
      typeof (issue as { message?: unknown }).message === "string"
        ? (issue as { message: string }).message
        : "";
    const path = Array.isArray((issue as { path?: unknown }).path)
      ? ((issue as { path: unknown[] }).path[0] as string | undefined)
      : undefined;
    if (!message || !path) return;
    mapped.push({ field: path, message });
  });
  return mapped;
};

export const TenantMembersSettingsSection = () => {
  const { can } = useAuthorization();
  const { user, isOwner: isCurrentUserOwner } = useAuth();
  const canManageMembers = can("tournament.manage");

  const membersQuery = useTenantMembersQuery(canManageMembers);
  const assignMutation = useAssignTenantMemberMutation();
  const updateMutation = useUpdateTenantMemberMutation();
  const deleteMutation = useDeleteTenantMemberMutation();

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TenantMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<TenantMember | null>(
    null,
  );
  const [assignError, setAssignError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const sortedMembers = useMemo(
    () =>
      [...(membersQuery.data ?? [])].sort((a, b) => {
        if (a.isOwner && !b.isOwner) return -1;
        if (!a.isOwner && b.isOwner) return 1;
        return a.user.fullName.localeCompare(b.user.fullName);
      }),
    [membersQuery.data],
  );

  const assignForm = useForm<z.input<typeof assignTenantMemberSchema>>({
    resolver: zodResolver(assignTenantMemberSchema),
    defaultValues: {
      email: "",
      role: "SCORER",
      status: "ACTIVE",
    },
  });

  const editForm = useForm<z.input<typeof editTenantMemberSchema>>({
    resolver: zodResolver(editTenantMemberSchema),
    defaultValues: {
      role: "SCORER",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (!editingMember) return;
    editForm.reset({
      role: editingMember.role,
      status: editingMember.status,
    });
  }, [editForm, editingMember]);

  const handleAssignSubmit = assignForm.handleSubmit(async (values) => {
    setAssignError(null);
    try {
      await assignMutation.mutateAsync({
        email: values.email,
        role: values.role,
        status: values.status ?? "ACTIVE",
      });
      toast.success("Member assigned.");
      setIsAssignOpen(false);
      assignForm.reset({
        email: "",
        role: "SCORER",
        status: "ACTIVE",
      });
    } catch (error) {
      const issues = getValidationIssues(error);
      issues.forEach((issue) => {
        if (
          issue.field === "email" ||
          issue.field === "role" ||
          issue.field === "status"
        ) {
          assignForm.setError(issue.field, {
            type: "server",
            message: issue.message,
          });
        }
      });
      if (issues.length === 0) {
        setAssignError(getMemberMutationMessage(error));
      }
    }
  });

  const handleEditSubmit = editForm.handleSubmit(async (values) => {
    if (!editingMember) return;
    if (editingMember.isOwner) {
      const message = "Tenant owner membership cannot be edited.";
      setEditError(message);
      toast.error(message);
      return;
    }
    setEditError(null);
    try {
      await updateMutation.mutateAsync({
        membershipId: editingMember.membershipId,
        payload: values,
      });
      toast.success("Member updated.");
      setEditingMember(null);
    } catch (error) {
      const issues = getValidationIssues(error);
      issues.forEach((issue) => {
        if (issue.field === "role" || issue.field === "status") {
          editForm.setError(issue.field, {
            type: "server",
            message: issue.message,
          });
        }
      });
      if (issues.length === 0) {
        setEditError(getMemberMutationMessage(error));
      }
    }
  });

  const handleDelete = async () => {
    if (!deletingMember) return;
    if (deletingMember.isOwner) {
      const message = "Tenant owner membership cannot be removed.";
      setDeleteError(message);
      toast.error(message);
      return;
    }
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(deletingMember.membershipId);
      toast.success("Member removed.");
      setDeletingMember(null);
    } catch (error) {
      setDeleteError(getMemberMutationMessage(error));
    }
  };

  if (!canManageMembers) {
    return (
      <Card className="p-6 text-sm text-warning-30">
        You do not have permission to manage tenant members.
      </Card>
    );
  }

  if (membersQuery.isLoading) {
    return (
      <Card className="p-6 text-sm text-neutral-40">Loading members...</Card>
    );
  }

  if (membersQuery.isError) {
    return (
      <Card className="p-6 text-sm text-error-40">
        {getMemberMutationMessage(membersQuery.error)}
      </Card>
    );
  }

  return (
    <>
      <Card className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-primary-20">
              Tenant Members
            </h2>
            <p className="mt-1 text-sm text-neutral-40">
              Manage member roles and access status for this tenant.
            </p>
            {isCurrentUserOwner ? (
              <p className="mt-1 text-xs font-semibold text-primary-30">
                You are the tenant owner.
              </p>
            ) : null}
          </div>
          <Button type="button" size="sm" onClick={() => setIsAssignOpen(true)}>
            Assign member
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-neutral-90">
          <table className="w-full min-w-155 text-sm">
            <thead>
              <tr className="bg-neutral-98 text-xs uppercase tracking-[0.12em] text-neutral-40">
                <th className="w-64 px-3 py-2 text-left">Member</th>
                <th className="w-24 px-3 py-2 text-left">Role</th>
                <th className="w-24 px-3 py-2 text-left">Membership</th>
                <th className="w-20 px-3 py-2 text-left">User</th>
                <th className="w-32 px-3 py-2 text-left">Member Since</th>
                <th className="w-24 px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedMembers.length === 0 ? (
                <tr className="border-t border-neutral-90">
                  <td colSpan={6} className="px-3 py-4 text-sm text-neutral-40">
                    No tenant members found.
                  </td>
                </tr>
              ) : (
                sortedMembers.map((row) => (
                  <tr
                    key={row.membershipId}
                    className="border-t border-neutral-90 transition-colors hover:bg-neutral-98"
                  >
                    <td className="px-3 py-2">
                      <p className="font-semibold text-primary-10 flex">
                        {row.user.fullName}
                        {row.isOwner ? (
                          <BadgePill
                            label={
                              user?.id && row.user.id === user.id
                                ? "Owner (You)"
                                : "Owner"
                            }
                            className="ml-4"
                          />
                        ) : null}
                      </p>
                      <p className="text-xs text-neutral-40">
                        {row.user.email}
                      </p>
                    </td>
                    <td className="px-3 py-2">
                      <RoleBadge role={row.role} />
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge status={row.status} label={row.status} />
                    </td>
                    <td className="px-3 py-2">
                      <StatusBadge
                        status={row.user.status}
                        label={row.user.status}
                      />
                    </td>
                    <td className="px-3 py-2">
                      {formatMemberDate(row.createdAt)}
                    </td>
                    <td className="px-3 py-2">
                      {!row.isOwner ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            appearance="outline"
                            color="neutral"
                            shape="square"
                            className="h-8 w-8 p-0"
                            aria-label={`Edit ${row.user.fullName}`}
                            title="Edit member"
                            disabled={!canManageMembers}
                            onClick={() => {
                              setEditError(null);
                              setEditingMember(row);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            appearance="outline"
                            color="error"
                            shape="square"
                            className="h-8 w-8 p-0"
                            aria-label={`Remove ${row.user.fullName}`}
                            title="Remove member"
                            disabled={!canManageMembers}
                            onClick={() => setDeletingMember(row)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <RightSideModal
        isOpen={isAssignOpen}
        onClose={() => {
          setIsAssignOpen(false);
          setAssignError(null);
          assignForm.reset({
            email: "",
            role: "SCORER",
            status: "ACTIVE",
          });
        }}
        title="Assign member"
        description="Add a user to this tenant or update existing membership."
        showCloseButton={!assignMutation.isPending}
        closeOnOverlayClick={!assignMutation.isPending}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              size="sm"
              appearance="outline"
              color="neutral"
              disabled={assignMutation.isPending}
              onClick={() => setIsAssignOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={assignMutation.isPending}
              onClick={() => void handleAssignSubmit()}
            >
              {assignMutation.isPending ? "Saving..." : "Assign"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <FormGroup
            label="Email"
            error={assignForm.formState.errors.email?.message}
            hint="Existing user email in this system."
          >
            <InputField
              type="email"
              placeholder="user@cricket.local"
              {...assignForm.register("email")}
            />
          </FormGroup>
          <FormGroup
            label="Role"
            error={assignForm.formState.errors.role?.message}
          >
            <SelectField
              options={roleOptions}
              {...assignForm.register("role")}
            />
          </FormGroup>
          <FormGroup
            label="Membership status"
            error={assignForm.formState.errors.status?.message}
          >
            <SelectField
              options={statusOptions}
              {...assignForm.register("status")}
            />
          </FormGroup>
          {assignError ? (
            <p className="text-xs font-semibold text-error-40">{assignError}</p>
          ) : null}
        </div>
      </RightSideModal>

      <RightSideModal
        isOpen={Boolean(editingMember)}
        onClose={() => {
          setEditingMember(null);
          setEditError(null);
        }}
        title="Edit member"
        description="Update role or membership status."
        showCloseButton={!updateMutation.isPending}
        closeOnOverlayClick={!updateMutation.isPending}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              size="sm"
              appearance="outline"
              color="neutral"
              disabled={updateMutation.isPending}
              onClick={() => setEditingMember(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={updateMutation.isPending || editingMember?.isOwner}
              onClick={() => void handleEditSubmit()}
            >
              {updateMutation.isPending ? "Saving..." : "Update"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          {editingMember?.isOwner ? (
            <p className="text-xs font-semibold text-warning-30">
              Tenant owner membership cannot be edited.
            </p>
          ) : null}
          <FormGroup
            label="Role"
            error={editForm.formState.errors.role?.message}
          >
            <SelectField
              options={roleOptions}
              {...editForm.register("role")}
              disabled={editingMember?.isOwner}
            />
          </FormGroup>
          <FormGroup
            label="Membership status"
            error={editForm.formState.errors.status?.message}
          >
            <SelectField
              options={statusOptions}
              {...editForm.register("status")}
              disabled={editingMember?.isOwner}
            />
          </FormGroup>
          {editError ? (
            <p className="text-xs font-semibold text-error-40">{editError}</p>
          ) : null}
        </div>
      </RightSideModal>

      <RightSideModal
        isOpen={Boolean(deletingMember)}
        onClose={() => {
          setDeletingMember(null);
          setDeleteError(null);
        }}
        title="Remove member"
        description="This will remove tenant access for this membership."
        showCloseButton={!deleteMutation.isPending}
        closeOnOverlayClick={!deleteMutation.isPending}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              size="sm"
              appearance="outline"
              color="neutral"
              disabled={deleteMutation.isPending}
              onClick={() => setDeletingMember(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              appearance="filled"
              color="error"
              disabled={deleteMutation.isPending || deletingMember?.isOwner}
              onClick={() => void handleDelete()}
            >
              {deleteMutation.isPending ? "Removing..." : "Remove"}
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          {deletingMember?.isOwner ? (
            <p className="text-xs font-semibold text-warning-30">
              Tenant owner membership cannot be removed.
            </p>
          ) : null}
          <p className="text-sm text-primary-20">
            Remove{" "}
            <span className="font-semibold">
              {deletingMember?.user.fullName}
            </span>{" "}
            from this tenant?
          </p>
          {deleteError ? (
            <p className="text-xs font-semibold text-error-40">{deleteError}</p>
          ) : null}
        </div>
      </RightSideModal>
    </>
  );
};
