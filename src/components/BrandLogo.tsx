import logo from "@/assets/icon.png";

interface BrandLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  collapsed?: boolean;
}

const BrandLogo: React.FC<BrandLogoProps> = ({
  className = "",
  size = 32,
  showText = true,
  collapsed = false,
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className="shrink-0 overflow-hidden rounded-lg shadow-sm"
        style={{ width: size, height: size }}
      >
        <img
          src={logo}
          alt="presently. logo"
          className="w-full h-full object-contain"
        />
      </div>
      {showText && !collapsed && (
        <span className="text-lg font-semibold tracking-tight text-primary">
          presently<span className="text-orange-500">.</span>
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
