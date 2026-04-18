interface IconProps {
  name: string;
  fill?: boolean;
  className?: string;
  size?: number;
  "aria-hidden"?: boolean;
  "aria-label"?: string;
}

export default function Icon({ name, fill = false, className = "", size, "aria-hidden": ariaHidden = true, "aria-label": ariaLabel }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      aria-hidden={ariaLabel ? undefined : ariaHidden}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
      style={{
        fontVariationSettings: fill
          ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
          : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
        ...(size ? { fontSize: size } : {}),
      }}
    >
      {name}
    </span>
  );
}
