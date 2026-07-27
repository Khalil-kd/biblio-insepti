import { resolveCustomPromptIconKey, type CustomPromptIconKey } from "@/lib/custom-icons";

const paths: Record<CustomPromptIconKey, React.ReactNode> = {
  code: <path d="m9 7-4 5 4 5m6-10 4 5-4 5m-3-12-2 14" />,
  brain: <path d="M9.5 5.5A3 3 0 0 0 4 7.2a3 3 0 0 0 .8 5.7A3 3 0 0 0 9.5 18m5-12.5A3 3 0 0 1 20 7.2a3 3 0 0 1-.8 5.7 3 3 0 0 1-4.7 5.1M12 4v16m-2.5-9H12m2.5 3H12" />,
  rocket: <path d="M14 5c2.4-2 4.8-2 5-2 .1.3.2 2.7-2 5l-4.5 4.5-4-1-1-4L14 5Zm-6 7-3 1-2 3 5-.5M12 16l-1 5 3-2 1-3M6.5 18.5l-2 2" />,
  cube: <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 9 8-4.5M12 12 4 7.5M12 12v9" />,
};

export function CustomPromptIcon({
  iconKey = "code",
  className = "h-8 w-8",
  size,
}: {
  iconKey?: string | null;
  className?: string;
  size?: number;
}) {
  const resolvedKey = resolveCustomPromptIconKey(iconKey);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-blue-500 to-emerald-400 text-white shadow-sm ${className}`}
      style={size ? { width: size, height: size } : undefined}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-[62%] w-[62%]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {paths[resolvedKey]}
      </svg>
    </span>
  );
}
