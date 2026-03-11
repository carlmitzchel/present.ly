import BrandLogo from "./BrandLogo";

interface EmptyStateProps {
  title?: string;
  subtitle?: string;
}

const EmptyState = ({
  title = "This Feature Is Not Yet Available",
  subtitle = "We're building this for a future release. Stay tuned for updates.",
}: EmptyStateProps) => {
  return (
    <div className="flex-1 flex items-center justify-center animate-fade-in">
      <div className="text-center max-w-sm">
        <div className="mx-auto flex justify-center mb-6">
          <BrandLogo size={48} showText={false} />
        </div>
        <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-6">
          {subtitle}
        </p>
        <button
          disabled
          className="px-5 py-2 rounded-lg text-sm font-medium bg-muted text-muted-foreground cursor-not-allowed"
        >
          Coming Soon
        </button>
      </div>
    </div>
  );
};

export default EmptyState;
