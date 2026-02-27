import { Gauge, Eye, Activity, TrendingUp } from "lucide-react";

const profiles = [
  { label: "Casual", active: true },
  { label: "Academic", active: false },
  { label: "Speech", active: false },
];

const metrics = [
  { label: "Avg WPM", value: "238", change: "+12%", icon: Gauge },
  { label: "Eye Stability", value: "82%", change: "+5%", icon: Eye },
  { label: "Consistency", value: "76%", change: "+3%", icon: Activity },
];

const ReadingProfileView = () => {
  return (
    <div className="flex-1 p-6 overflow-y-auto animate-fade-in">
      {/* Profile type selector */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-1">
          Reading Profile
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Track your reading performance over time
        </p>
        <div className="flex gap-2">
          {profiles.map((p) => (
            <button
              key={p.label}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                p.active
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="rounded-xl bg-card border border-border p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-medium text-primary">
                  {m.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">
                {m.value}
              </p>
              <p className="text-xs text-muted-foreground">{m.label}</p>
            </div>
          );
        })}
      </div>

      {/* Chart placeholder */}
      <div className="rounded-xl bg-card border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Performance Trend
            </h3>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </div>
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="h-48 flex items-end gap-2 px-2">
          {Array.from({ length: 20 }, (_, i) => {
            const height = 30 + Math.sin(i * 0.5) * 25 + Math.random() * 20;
            return (
              <div
                key={i}
                className="flex-1 rounded-t bg-primary/20 hover:bg-primary/40 transition-colors"
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-2 px-2">
          <span className="text-[10px] text-muted-foreground">Jan 28</span>
          <span className="text-[10px] text-muted-foreground">Feb 27</span>
        </div>
      </div>
    </div>
  );
};

export default ReadingProfileView;
