import { useEffect, useState } from "react";
import { formatDistanceToNowStrict, isValid, parseISO } from "date-fns";
import { toast } from "sonner";
import { Copy, Link2, MessageCircle, Trash2 } from "lucide-react";
import { RightSideModal } from "@/shared/components/modals/RightSideModal";
import { Button } from "@/components/ui/button/Button";
import { InputField } from "@/components/ui/form/InputField";
import { FormGroup } from "@/components/ui/form/FormGroup";
import { useCreateTeamAccessLinkMutation } from "@/features/teams/hooks/useCreateTeamAccessLinkMutation";
import { useCreateTeamAccessWhatsappShareMutation } from "@/features/teams/hooks/useCreateTeamAccessWhatsappShareMutation";
import { useRevokeTeamAccessLinkMutation } from "@/features/teams/hooks/useRevokeTeamAccessLinkMutation";
import { useTeamAccessCurrentShareQuery } from "@/features/teams/hooks/useTeamAccessCurrentShareQuery";
import { useTeamAccessLinksQuery } from "@/features/teams/hooks/useTeamAccessLinksQuery";
import { normalizeApiError } from "@/shared/utils/apiErrors";

type Props = {
  teamId: string;
  teamName: string;
  teamContactNumber?: string | null;
  isOpen: boolean;
  onClose: () => void;
};

const PUBLIC_APP_URL = (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined)
  ?.trim()
  .replace(/\/+$/, "");

const normalizeAccessUrl = (accessUrl: string | undefined, token?: string) => {
  const origin = PUBLIC_APP_URL || window.location.origin;
  const fallback = token ? `${origin}/team-access/${token}` : origin;
  if (!accessUrl) return fallback;
  if (/^https?:\/\//i.test(accessUrl)) return accessUrl;
  if (accessUrl.startsWith("*/team-access/")) {
    return `${origin}${accessUrl.slice(1)}`;
  }
  if (accessUrl.startsWith("/team-access/")) {
    return `${origin}${accessUrl}`;
  }
  return fallback;
};

const buildWhatsappUrl = (phoneNumber: string, message: string) =>
  `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

const normalizeShareMessage = (
  message: string,
  token: string,
  accessUrl: string | undefined,
) => {
  const resolvedAccessUrl = normalizeAccessUrl(accessUrl, token);
  const replaced = (message || "").replaceAll(`*/team-access/${token}`, resolvedAccessUrl);
  return replaced
    .replace(/(https?:\/\/\S+)/g, "\n$1\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const renderLinkifiedText = (text: string) =>
  text.split(/(https?:\/\/[^\s]+)/g).map((part, index) => {
    if (/^https?:\/\/[^\s]+$/.test(part)) {
      return (
        <a
          key={`${part}-${index}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-20 underline underline-offset-2 hover:text-primary-10"
        >
          {part}
        </a>
      );
    }

    return <span key={`${index}`}>{part}</span>;
  });

const mapTeamAccessError = (error: unknown) => {
  const normalized = normalizeApiError(error);
  switch (normalized.code) {
    case "team_access.not_found":
      return "Access link not found.";
    case "team_access.phone_missing":
      return "Phone number is missing. Enter a number or set team contact number.";
    case "team_access.phone_invalid":
      return "Invalid WhatsApp number format.";
    case "team.not_found":
      return "Team not found.";
    case "auth.forbidden":
      return "You do not have permission to manage access links.";
    case "validation.failed":
      return normalized.message || "Invalid access link settings.";
    default:
      return normalized.message || "Unable to manage team access links.";
  }
};

const relativeTime = (iso: string) => {
  const parsed = parseISO(iso);
  if (!isValid(parsed)) return "-";
  return formatDistanceToNowStrict(parsed, { addSuffix: true });
};

export const TeamAccessLinksModal = ({
  teamId,
  teamName,
  teamContactNumber,
  isOpen,
  onClose,
}: Props) => {
  const linksQuery = useTeamAccessLinksQuery(teamId, isOpen);
  const currentShareQuery = useTeamAccessCurrentShareQuery(teamId, isOpen);
  const createMutation = useCreateTeamAccessLinkMutation(teamId);
  const whatsappShareMutation = useCreateTeamAccessWhatsappShareMutation(teamId);
  const revokeMutation = useRevokeTeamAccessLinkMutation(teamId);
  const [expiresInHours, setExpiresInHours] = useState<string>("12");
  const [phoneNumber, setPhoneNumber] = useState<string>(teamContactNumber ?? "");
  const isBusy =
    createMutation.isPending || revokeMutation.isPending || whatsappShareMutation.isPending;
  const currentShare = currentShareQuery.data;
  const currentAccessUrl = currentShare?.accessUrl
    ? normalizeAccessUrl(currentShare.accessUrl, "")
    : null;

  useEffect(() => {
    if (!isOpen) return;
    setExpiresInHours("12");
    setPhoneNumber(currentShare?.phoneNumber ?? teamContactNumber ?? "");
  }, [isOpen, teamContactNumber, currentShare?.phoneNumber]);

  const parseExpiresValue = () => {
    const parsedHours =
      expiresInHours.trim().length === 0 ? undefined : Number(expiresInHours);
    const hasInvalidHours =
      parsedHours !== undefined && (!Number.isInteger(parsedHours) || parsedHours <= 0);
    if (hasInvalidHours) {
      toast.error("Expiry must be a positive whole number of hours.");
      return null;
    }
    return parsedHours;
  };

  const onGenerate = async () => {
    const parsedHours = parseExpiresValue();
    if (parsedHours === null) return;

    try {
      await createMutation.mutateAsync(
        parsedHours ? { expiresInHours: parsedHours } : undefined,
      );
      await currentShareQuery.refetch();
      toast.success("Link regenerated.");
    } catch (error) {
      toast.error(mapTeamAccessError(error));
    }
  };

  const onShareWhatsapp = async () => {
    const parsedHours = parseExpiresValue();
    if (parsedHours === null) return;

    try {
      const data = await whatsappShareMutation.mutateAsync({
        expiresInHours: parsedHours,
        phoneNumber: phoneNumber.trim().length > 0 ? phoneNumber.trim() : undefined,
      });
      const resolvedMessage = normalizeShareMessage(
        data.message,
        data.token,
        data.accessUrl,
      );
      const resolvedWhatsappUrl = data.whatsappUrl
        ? data.whatsappUrl
        : buildWhatsappUrl(data.phoneNumber, resolvedMessage);
      await currentShareQuery.refetch();
      window.open(resolvedWhatsappUrl, "_blank", "noopener,noreferrer");
      toast.success("WhatsApp share link is ready.");
    } catch (error) {
      toast.error(mapTeamAccessError(error));
    }
  };

  const onRevoke = async (linkId: string) => {
    try {
      await revokeMutation.mutateAsync(linkId);
      await currentShareQuery.refetch();
      toast.success("Access link revoked.");
    } catch (error) {
      toast.error(mapTeamAccessError(error));
    }
  };

  return (
    <RightSideModal
      isOpen={isOpen}
      onClose={onClose}
      title="Team Access Links"
      description={`Manage public player-management links for ${teamName}.`}
      showCloseButton={!isBusy}
      closeOnOverlayClick={!isBusy}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            size="sm"
            appearance="outline"
            color="neutral"
            onClick={onClose}
            disabled={isBusy}
          >
            Close
          </Button>
          <Button
            type="button"
            size="sm"
            appearance="outline"
            color="neutral"
            onClick={() => void onShareWhatsapp()}
            disabled={isBusy}
          >
            {whatsappShareMutation.isPending ? "Preparing..." : "Share via WhatsApp"}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void onGenerate()}
            disabled={isBusy}
          >
            {createMutation.isPending ? "Regenerating..." : "Regenerate link"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="rounded-xl border border-warning-80 bg-warning-95 px-3 py-2 text-xs text-warning-30">
          Regenerating replaces the previous link immediately.
        </p>
        <FormGroup
          label="Expires in hours (optional)"
          hint="Leave empty to use backend default expiry."
        >
          <InputField
            type="number"
            min={1}
            value={expiresInHours}
            onChange={(event) => setExpiresInHours(event.target.value)}
            placeholder="e.g. 24"
          />
        </FormGroup>
        <FormGroup
          label="WhatsApp number (optional)"
          hint="Leave empty to use the team's contact number."
        >
          <InputField
            type="text"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder="e.g. 94771234567"
          />
        </FormGroup>

        {currentShareQuery.isLoading ? (
          <div className="rounded-xl border border-neutral-90 px-3 py-3 text-sm text-neutral-40">
            Loading current share...
          </div>
        ) : currentShareQuery.isError ? (
          <div className="rounded-xl border border-error-80 bg-error-95 px-3 py-3 text-sm text-error-40">
            {mapTeamAccessError(currentShareQuery.error)}
          </div>
        ) : currentShare ? (
          <div className="space-y-3 rounded-xl border border-neutral-90 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-40">
              Current active share
            </p>
            <p className="text-xs text-neutral-40">Expires {relativeTime(currentShare.expiresAt)}</p>
            {currentAccessUrl ? (
              <FormGroup label="Access URL">
                <div className="space-y-2">
                  <a
                    href={currentAccessUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex text-xs font-medium text-primary-20 underline underline-offset-2 hover:text-primary-10"
                  >
                    Open access link
                  </a>
                  <div className="flex items-center gap-2">
                    <InputField value={currentAccessUrl} readOnly />
                    <Button
                      type="button"
                      size="sm"
                      appearance="outline"
                      color="neutral"
                      shape="square"
                      className="h-10 w-10 p-0"
                      onClick={() => {
                        void navigator.clipboard
                          .writeText(currentAccessUrl)
                          .then(() => toast.success("Access URL copied."));
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </FormGroup>
            ) : null}
            <FormGroup label="Message">
              <div className="space-y-2">
                <div className="rounded-lg border border-neutral-90 bg-neutral-99 p-2 text-xs text-neutral-30">
                  <p className="whitespace-pre-wrap break-words">
                    {renderLinkifiedText(normalizeShareMessage(currentShare.message, "", currentAccessUrl ?? undefined))}
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    size="sm"
                    appearance="outline"
                    color="neutral"
                    onClick={() => {
                      const resolvedMessage = normalizeShareMessage(
                        currentShare.message,
                        "",
                        currentAccessUrl ?? undefined,
                      );
                      void navigator.clipboard
                        .writeText(resolvedMessage)
                        .then(() => toast.success("Message copied."));
                    }}
                  >
                    Copy message
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const resolvedMessage = normalizeShareMessage(
                        currentShare.message,
                        "",
                        currentAccessUrl ?? undefined,
                      );
                      const url =
                        currentShare.whatsappUrl ||
                        (currentShare.phoneNumber
                          ? buildWhatsappUrl(currentShare.phoneNumber, resolvedMessage)
                          : null);
                      if (!url) {
                        toast.error("Phone number is missing. Add a WhatsApp number.");
                        return;
                      }
                      window.open(url, "_blank", "noopener,noreferrer");
                    }}
                    disabled={!currentShare.whatsappUrl && !currentShare.phoneNumber}
                  >
                    <MessageCircle className="mr-1 h-4 w-4" />
                    Open WhatsApp
                  </Button>
                </div>
                {!currentShare.phoneNumber ? (
                  <p className="text-xs text-warning-30">
                    Phone number is missing. Share on WhatsApp is unavailable.
                  </p>
                ) : null}
              </div>
            </FormGroup>
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-90 px-3 py-3 text-sm text-neutral-40">
            No active link. Generate a new team access link.
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-neutral-90">
          <div className="grid grid-cols-[1fr_auto] bg-neutral-98 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-40">
            <p>Link</p>
            <p>Actions</p>
          </div>
          {linksQuery.isLoading ? (
            <p className="px-3 py-3 text-sm text-neutral-40">Loading links...</p>
          ) : linksQuery.isError ? (
            <p className="px-3 py-3 text-sm text-error-40">
              {mapTeamAccessError(linksQuery.error)}
            </p>
          ) : (linksQuery.data ?? []).length === 0 ? (
            <p className="px-3 py-3 text-sm text-neutral-40">No active links.</p>
          ) : (
            (linksQuery.data ?? []).map((link) => (
              <div
                key={link.id}
                className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-neutral-90 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium text-primary-20">
                    <Link2 className="mr-1 inline h-4 w-4" />
                    Link #{link.id.slice(0, 8)}
                  </p>
                  <p className="text-xs text-neutral-40">
                    Expires {relativeTime(link.expiresAt)}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  appearance="outline"
                  color="error"
                  shape="square"
                  className="h-8 w-8 p-0"
                  onClick={() => void onRevoke(link.id)}
                  disabled={isBusy}
                  title="Revoke link"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </RightSideModal>
  );
};
