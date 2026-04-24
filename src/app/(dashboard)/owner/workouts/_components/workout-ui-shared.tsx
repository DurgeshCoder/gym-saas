import { PlayCircle } from "lucide-react";

// ─── Shared helper ───────────────────────────────────────────────────────────
export function getYoutubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp =
    /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?rel=0`;
  }
  return null;
}

// ─── Difficulty badge colour helper ──────────────────────────────────────────
export const difficultyConfig: Record<
  string,
  { label: string; className: string }
> = {
  BEGINNER: {
    label: "Beginner",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  },
  INTERMEDIATE: {
    label: "Intermediate",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  },
  ADVANCED: {
    label: "Advanced",
    className:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
  },
};

export const goalConfig: Record<string, { label: string; className: string }> =
  {
    FAT_LOSS: {
      label: "Fat Loss",
      className:
        "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
    },
    MUSCLE_GAIN: {
      label: "Muscle Gain",
      className:
        "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800",
    },
    STRENGTH: {
      label: "Strength",
      className:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    },
    GENERAL_FITNESS: {
      label: "General Fitness",
      className:
        "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800",
    },
  };

// ─── Media presenter (shared by Edit + View) ─────────────────────────────────
export function MediaPresenter({
  videoUrl,
  videoType,
  compact = false,
}: {
  videoUrl: string;
  videoType: string;
  compact?: boolean;
}) {
  if (!videoUrl) return null;

  const isYoutube =
    videoType === "YOUTUBE" ||
    videoUrl.includes("youtube.com") ||
    videoUrl.includes("youtu.be");

  const wrapperCls = compact
    ? "mt-2 w-full max-w-[200px] aspect-video overflow-hidden rounded-lg border border-border shadow-sm"
    : "w-full aspect-video overflow-hidden rounded-xl border border-border shadow-sm";

  if (isYoutube) {
    const embedUrl = getYoutubeEmbedUrl(videoUrl);
    if (!embedUrl) {
      return (
        <a
          href={videoUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-primary hover:underline"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          View on YouTube
        </a>
      );
    }
    return (
      <div className={`${wrapperCls} bg-black`}>
        <iframe
          src={embedUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  const isVideo = videoUrl.match(/\.(mp4|webm)$/i);
  if (isVideo) {
    return (
      <div className={`${wrapperCls} bg-black flex items-center justify-center`}>
        <video
          src={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`${wrapperCls} bg-muted/30 flex items-center justify-center`}
    >
      <img
        src={videoUrl}
        alt="Exercise demo"
        className="w-full h-full object-contain"
      />
    </div>
  );
}

// ─── Stat Badge ──────────────────────────────────────────────────────────────
export function StatBadge({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-3 py-2 rounded-lg border border-border bg-muted/30 min-w-[60px] text-center">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
        {label}
      </span>
      <span className="text-sm font-bold text-foreground leading-none">
        {value}
      </span>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({
  icon,
  title,
  description,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon && (
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      )}
      <div>
        <h2 className="text-base font-semibold text-foreground leading-tight">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

// ─── Form Skeleton ─────────────────────────────────────────────────────────────
export function WorkoutFormSkeleton() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 pb-6 border-b border-border/50">
        <div className="w-9 h-9 rounded-lg bg-muted" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-muted rounded-md" />
          <div className="h-4 w-72 bg-muted rounded-md" />
        </div>
      </div>
      {/* Tab skeleton */}
      <div className="flex gap-6 border-b border-border/60 pb-0">
        <div className="h-9 w-28 bg-muted rounded-t-md" />
        <div className="h-9 w-28 bg-muted rounded-t-md opacity-50" />
      </div>
      {/* Card skeleton */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="h-16 bg-muted/40" />
        <div className="p-6 space-y-5">
          <div className="h-10 bg-muted rounded-lg" />
          <div className="h-20 bg-muted rounded-lg" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-muted rounded-lg" />
            <div className="h-10 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
      {/* Exercise card skeleton */}
      <div className="rounded-xl border border-border/50 overflow-hidden">
        <div className="h-16 bg-muted/40" />
        <div className="p-6 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-border/50 p-4 space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-2 h-9 bg-muted rounded-lg" />
                <div className="h-9 bg-muted rounded-lg" />
                <div className="h-9 bg-muted rounded-lg" />
              </div>
              <div className="h-8 bg-muted/50 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
