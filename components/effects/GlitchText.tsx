import type { CSSProperties } from "react";
import "./GlitchText.css";

type GlitchTextStyle = CSSProperties & {
  "--after-duration": string;
  "--before-duration": string;
  "--after-shadow": string;
  "--before-shadow": string;
};

export interface GlitchTextProps {
  children: string;
  speed?: number;
  enableShadows?: boolean;
  enableOnHover?: boolean;
  className?: string;
}

export default function GlitchText({
  children,
  speed = 1,
  enableShadows = true,
  enableOnHover = true,
  className = "",
}: GlitchTextProps) {
  const inlineStyles: GlitchTextStyle = {
    "--after-duration": `${speed * 3}s`,
    "--before-duration": `${speed * 2}s`,
    "--after-shadow": enableShadows ? "-5px 0 #ff2d18" : "none",
    "--before-shadow": enableShadows ? "5px 0 #00e5ff" : "none",
  };

  const hoverClass = enableOnHover ? "glitch-enable-on-hover" : "";

  return (
    <div
      className={`glitch-text ${hoverClass} ${className}`.trim()}
      style={inlineStyles}
      data-text={children}
    >
      {children}
    </div>
  );
}
