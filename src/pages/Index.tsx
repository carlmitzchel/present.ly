import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import TeleprompterView from "@/features/teleprompter/components/MainView";
import RecorderView from "@/features/recorder/components/RecorderView";
import ReadingTestView from "@/components/ReadingTestView";
import ReadingProfileView from "@/components/ReadingProfileView";
import SettingsView from "@/components/SettingsView";
import EmptyState from "@/components/EmptyState";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [activeView, setActiveView] = useState("teleprompter");
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);

  // Auto-collapse on small screens
  const sidebarCollapsed = isMobile || collapsed;

  const renderView = () => {
    switch (activeView) {
      case "teleprompter":
        return <TeleprompterView />;
      case "recorder":
        return <RecorderView />;
      case "reading-test":
        return <ReadingTestView />;
      case "reading-profile":
        return <ReadingProfileView />;
      case "settings":
        return <SettingsView />;
      case "analytics":
        return (
          <EmptyState
            title="Feature in Development"
            subtitle="Analytics will provide detailed insights into your reading patterns. This capability will be available in a future update."
          />
        );
      case "cloud-sync":
        return (
          <EmptyState
            title="Feature in Development"
            subtitle="Cloud Sync will keep your reading data synchronized across all your devices. This capability will be available in a future update."
          />
        );
      default:
        return <TeleprompterView />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar
          activeView={activeView}
          onNavigate={setActiveView}
          collapsed={sidebarCollapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default Index;
