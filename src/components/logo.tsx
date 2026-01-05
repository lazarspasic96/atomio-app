import { cn } from "~/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "wordmark";
  theme?: "light" | "dark" | "auto";
}

const sizes = {
  sm: { icon: 24, text: "text-lg" },
  md: { icon: 32, text: "text-xl" },
  lg: { icon: 40, text: "text-2xl" },
  xl: { icon: 48, text: "text-3xl" },
};

export function Logo({
  className,
  size = "md",
  variant = "full",
  theme = "auto",
}: LogoProps) {
  const { icon: iconSize, text: textSize } = sizes[size];

  // Colors based on theme
  const primaryColor = theme === "light" ? "#000000" : "#FFFFFF";
  const accentColor = "#10B981"; // Emerald green

  const orbitColor = theme === "auto" ? "currentColor" : (theme === "light" ? "#6B7280" : "#6B7280");

  const LogoIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* First orbital ring - tilted left */}
      <ellipse
        cx="24"
        cy="24"
        rx="18"
        ry="8"
        stroke={orbitColor}
        strokeWidth="2.5"
        strokeOpacity="0.6"
        fill="none"
        transform="rotate(-45 24 24)"
      />
      {/* Second orbital ring - tilted right */}
      <ellipse
        cx="24"
        cy="24"
        rx="18"
        ry="8"
        stroke={orbitColor}
        strokeWidth="2.5"
        strokeOpacity="0.6"
        fill="none"
        transform="rotate(45 24 24)"
      />
      {/* Center nucleus - white */}
      <circle
        cx="24"
        cy="24"
        r="7"
        fill={theme === "auto" ? "currentColor" : primaryColor}
      />
      {/* Green electron dot */}
      <circle
        cx="37"
        cy="11"
        r="5"
        fill={accentColor}
      />
    </svg>
  );

  const textColorClass = theme === "auto"
    ? "text-foreground"
    : theme === "light"
      ? "text-gray-900"
      : "text-white";

  if (variant === "icon") {
    return (
      <div className={cn("inline-flex items-center", className)}>
        <LogoIcon />
      </div>
    );
  }

  if (variant === "wordmark") {
    return (
      <span className={cn("font-semibold tracking-tight lowercase", textSize, textColorClass, className)}>
        atomi<span className="text-emerald-500">o</span>
      </span>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <LogoIcon />
      <span className={cn("font-semibold tracking-tight lowercase", textSize, textColorClass)}>
        atomi<span className="text-emerald-500">o</span>
      </span>
    </div>
  );
}

// Favicon component
export function LogoFavicon({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Dark background */}
      <rect width="48" height="48" rx="10" fill="#0A0A0A" />
      {/* First orbital ring */}
      <ellipse
        cx="24"
        cy="24"
        rx="14"
        ry="6"
        stroke="#6B7280"
        strokeWidth="2"
        strokeOpacity="0.6"
        fill="none"
        transform="rotate(-45 24 24)"
      />
      {/* Second orbital ring */}
      <ellipse
        cx="24"
        cy="24"
        rx="14"
        ry="6"
        stroke="#6B7280"
        strokeWidth="2"
        strokeOpacity="0.6"
        fill="none"
        transform="rotate(45 24 24)"
      />
      {/* Center nucleus */}
      <circle cx="24" cy="24" r="6" fill="white" />
      {/* Green electron */}
      <circle cx="34" cy="14" r="4" fill="#10B981" />
    </svg>
  );
}
