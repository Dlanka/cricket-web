import { Link, useLocation } from "@tanstack/react-router";
import { classNames } from "@/shared/utils/classNames";

const items = [
  { to: "/user-settings/profile" as const, label: "Profile" },
  { to: "/user-settings/preferences" as const, label: "Preferences" },
  { to: "/user-settings/security" as const, label: "Change Password" },
];

export const UserSettingsNav = () => {
  const location = useLocation();

  return (
    <div className="space-y-1">
      {items.map((item) => {
        const active =
          location.pathname === item.to ||
          (item.to === "/user-settings/profile" &&
            (location.pathname === "/user-settings" ||
              location.pathname === "/user-settings/"));
        return (
          <Link
            key={item.to}
            to={item.to}
            className={classNames(
              "block w-full border-l-2 px-3 py-2 text-left text-sm transition",
              active
                ? "border-primary/35 font-semibold text-on-primary-container"
                : "border-transparent text-on-surface-variant hover:text-on-primary-container",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
};

