import {
  MonitorPlay,
  // BookOpenCheck,
  // UserCircle,
  // BarChart3,
  Cloud,
  Settings,
  PanelLeftClose,
  PanelLeft,
  type LucideIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import BrandLogo from "./BrandLogo";

export type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
};

export const navItems: NavItem[] = [
  { id: "teleprompter", label: "Teleprompter", icon: MonitorPlay },
  // { id: "reading-test", label: "Reading Test", icon: BookOpenCheck },
  // { id: "reading-profile", label: "Reading Profile", icon: UserCircle },
  // { id: "analytics", label: "Analytics", icon: BarChart3, disabled: true },
  { id: "cloud-sync", label: "Cloud Sync", icon: Cloud, disabled: true },
  { id: "settings", label: "Settings", icon: Settings },
];

interface AppSidebarProps {
  activeView: string;
  onNavigate: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}
const AppSidebar = ({
  activeView,
  onNavigate,
  collapsed,
  onToggle,
}: AppSidebarProps) => {
  return (
    <div
      className={`shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200 ${
        collapsed ? "w-14" : "w-56"
      }`}
    >
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        <div
          className={`mb-8 px-2 flex justify-center ${collapsed ? "" : "justify-start"}`}
        >
          <BrandLogo collapsed={collapsed} size={collapsed ? 28 : 32} />
        </div>

        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          const buttonContent = (
            <>
              <Icon
                className={`w-4 h-4 shrink-0 ${isActive ? "text-primary" : ""}`}
              />
              {!collapsed && <span>{item.label}</span>}
            </>
          );

          if (item.disabled) {
            return (
              <Tooltip key={item.id} delayDuration={200}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm opacity-40 cursor-default transition-colors ${
                      collapsed ? "justify-center" : ""
                    }`}
                  >
                    {buttonContent}
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-surface-overlay text-foreground border-border text-xs"
                >
                  Available in Phase 2
                </TooltipContent>
              </Tooltip>
            );
          }

          // In collapsed mode, show tooltip with label
          const button = (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150
                  ${collapsed ? "justify-center" : ""}
                  ${
                    isActive
                      ? "bg-accent text-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
            >
              {buttonContent}
            </button>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.id} delayDuration={200}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-surface-overlay text-foreground border-border text-xs"
                >
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return button;
        })}
      </nav>

      <div
        className={`px-2 py-3  ${collapsed ? "flex justify-center" : "px-4"} flex flex-row items-center justify-between`}
      >
        <button
          onClick={onToggle}
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default AppSidebar;
