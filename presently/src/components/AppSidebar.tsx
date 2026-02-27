import {
  MonitorPlay,
  BookOpenCheck,
  UserCircle,
  BarChart3,
  Cloud,
  Settings,
  type LucideIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
};

export const navItems: NavItem[] = [
  { id: "teleprompter", label: "Teleprompter", icon: MonitorPlay },
  { id: "reading-test", label: "Reading Test", icon: BookOpenCheck },
  { id: "reading-profile", label: "Reading Profile", icon: UserCircle },
  { id: "analytics", label: "Analytics", icon: BarChart3, disabled: true },
  { id: "cloud-sync", label: "Cloud Sync", icon: Cloud, disabled: true },
  { id: "settings", label: "Settings", icon: Settings },
];

interface AppSidebarProps {
  activeView: string;
  onNavigate: (id: string) => void;
}

const AppSidebar = ({ activeView, onNavigate }: AppSidebarProps) => {
  return (
    <div className="w-56 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <Tooltip key={item.id} delayDuration={200}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm opacity-40 cursor-default transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
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

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150
                  ${
                    isActive
                      ? "bg-accent text-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-primary" : ""}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-sidebar-border">
        <p className="text-[11px] text-muted-foreground">ReadFlow v0.1.0</p>
      </div>
    </div>
  );
};

export default AppSidebar;
