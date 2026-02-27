import { useState } from "react";

import TeleprompterView from "@/components/TeleprompterView";
import ReadingTestView from "@/components/ReadingTestView";
import ReadingProfileView from "@/components/ReadingProfileView";
import SettingsView from "@/components/SettingsView";
import EmptyState from "@/components/EmptyState";
import TopBar from "@/components/TopBar";
import AppSidebar from "@/components/AppSidebar";

const Index = () => {
  const [activeView, setActiveView] = useState("teleprompter");

  const renderView = () => {
    switch (activeView) {
      case "teleprompter":
        return <TeleprompterView />;
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
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar activeView={activeView} onNavigate={setActiveView} />
        <main className="flex-1 flex flex-col overflow-hidden">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default Index;
