import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Loader({ className, size }: LoaderProps) {
  const sizeClass = size
    ? { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6", xl: "w-8 h-8" }[size]
    : "w-4 h-4";

  return (
    <svg
      className={cn("animate-spin shrink-0", sizeClass, className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label="Loading"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function PageLoader({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 min-h-[400px] text-primary">
      <Loader className="w-8 h-8" />
      {text && <p className="text-sm text-gray-500 animate-pulse">{text}</p>}
    </div>
  );
}

export function BrandedLoader({
  text = "Loading...",
  fullScreen = true,
}: {
  text?: string;
  fullScreen?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-8",
        fullScreen && "min-h-screen"
      )}
      style={{ backgroundColor: "var(--page-bg)" }}
    >
      <div className="relative animate-fade-in">
        <div className="relative w-20 h-20">
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full animate-spin"
            style={{
              border: "3px solid transparent",
              borderTopColor: "var(--primary)",
              borderRightColor: "var(--primary-light)",
            }}
          />
          {/* Inner icon */}
          <div
            className="absolute inset-3 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--primary-lighter)" }}
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
              <path
                d="M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h11a2 2 0 012 2v3"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <rect x="9" y="11" width="14" height="10" rx="2" stroke="var(--primary)" strokeWidth="2" />
              <circle cx="12" cy="19" r="1" fill="var(--primary)" />
              <circle cx="20" cy="19" r="1" fill="var(--primary)" />
            </svg>
          </div>
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          DriveGo
        </p>
        <p className="text-xs animate-pulse" style={{ color: "var(--text-secondary)" }}>
          {text}
        </p>
      </div>
    </div>
  );
}
