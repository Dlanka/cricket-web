import { Link, useLocation } from "@tanstack/react-router";
import { useAuthorization } from "@/features/authz/hooks/useAuthorization";
import { classNames } from "@/shared/utils/classNames";

const items = [
  { to: "/settings/organization" as const, label: "Organization" },
  { to: "/settings/defaults" as const, label: "Tournament Defaults" },
  { to: "/settings/match-rules" as const, label: "Match Rules" },
  { to: "/settings/permissions" as const, label: "Permissions" },
  { to: "/settings/tenant-members" as const, label: "Tenant Members" },
];

export const SettingsNav = () => {
  const location = useLocation();
  const { can } = useAuthorization();
  const canManageMembers = can("tournament.manage");

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const active =
          location.pathname === item.to ||
          (item.to === "/settings/organization" &&
            (location.pathname === "/settings" ||
              location.pathname === "/settings/"));
        return (
          <Link
            key={item.to}
            to={item.to}
            className={classNames(
              "block w-full border-l-2 px-3 py-2 text-left text-sm transition",
              item.to === "/settings/tenant-members" && !canManageMembers
                ? "cursor-not-allowed opacity-50"
                : "",
              active
                ? "border-primary-50 font-semibold text-primary-20"
                : "border-transparent text-neutral-40 hover:text-primary-20",
            )}
            disabled={item.to === "/settings/tenant-members" && !canManageMembers}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
};
