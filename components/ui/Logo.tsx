import Link from "next/link";
import { cn } from "@/lib/format";

interface LogoProps {
  href?: string;
  variant?: "dark" | "light";
  size?: "sm" | "md";
  className?: string;
}

export function LogoMark({ variant = "dark", size = "md", tilt = false }: { variant?: "dark" | "light"; size?: "sm" | "md"; tilt?: boolean }) {
  const box = size === "sm" ? "size-7 rounded-lg" : "size-[34px] rounded-[9px]";
  return (
    <span className={cn("grid place-items-center", box, variant === "dark" ? "bg-ink" : "bg-lime", tilt && "-rotate-6")}>
      <svg width={size === "sm" ? 14 : 18} height={size === "sm" ? 14 : 18} viewBox="0 0 24 24" fill="none" stroke={variant === "dark" ? "#C8F031" : "#0E1116"} strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 18 18 6M10 6h8v8" />
      </svg>
    </span>
  );
}

export default function Logo({ href = "/", variant = "dark", size = "md", className }: LogoProps) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)} aria-label="SharpBill home">
      <LogoMark variant={variant} size={size} tilt />
      <span className={cn("font-display font-extrabold tracking-tight", size === "sm" ? "text-lg" : "text-[22px]", variant === "light" ? "text-white" : "text-ink")}>
        SharpBill
      </span>
    </Link>
  );
}
