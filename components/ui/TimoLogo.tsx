"use client";

import Image from "next/image";
import { useTheme } from "@/components/layout/ThemeProvider";

type Props = {
  size?: number;
  className?: string;
};

export default function TimoLogo({ size = 44, className = "" }: Props) {
  const { theme } = useTheme();

  const src = theme === "dark" ? "/timo-logo-dark.png" : "/timo-logo-light.png";

  return (
    <Image
      src={src}
      alt="Timo logo"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
