import React from "react";
import { ViewStyle } from "react-native";
import Svg, { Circle, Defs, Path, Pattern, Rect } from "react-native-svg";

type Props = {
  style?: ViewStyle;
  color?: string; // stroke color
  opacity?: number; // overall opacity
  tileSize?: number; // pattern tile size in px
  variant?: "lattice" | "stars" | "dots"; // choose pattern style
};

// Subtle geometric lattice pattern (diagonal diamonds) with very low opacity
// Designed to sit behind the header content without overpowering the logo
export default function PatternOverlay({
  style,
  color = "rgba(255,255,255,0.5)",
  opacity = 0.06,
  tileSize = 24,
  variant = "lattice",
}: Props) {
  const s = tileSize;
  const strokeWidth = 0.75;

  return (
    <Svg
      pointerEvents="none"
      style={style as any}
      width="100%"
      height="100%"
      viewBox={`0 0 ${s} ${s}`}
      preserveAspectRatio="none"
    >
      <Defs>
        {variant === "stars" ? (
          <Pattern id="geoPattern" x={0} y={0} width={s} height={s} patternUnits="userSpaceOnUse">
            {/* 8-point star: overlay of a diamond and a square */}
            {/* Outer diamond */}
            <Path
              d={`M ${s / 2} 0 L ${s} ${s / 2} L ${s / 2} ${s} L 0 ${s / 2} Z`}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            {/* Inner square */}
            <Path
              d={`M ${s / 4} ${s / 4} L ${(3 * s) / 4} ${s / 4} L ${(3 * s) / 4} ${(3 * s) / 4} L ${s / 4} ${(3 * s) / 4} Z`}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              opacity={0.75}
            />
          </Pattern>
        ) : variant === "dots" ? (
          <Pattern id="geoPattern" x={0} y={0} width={s} height={s} patternUnits="userSpaceOnUse">
            <Circle cx={s / 2} cy={s / 2} r={1.2} fill={color} />
          </Pattern>
        ) : (
          <Pattern id="geoPattern" x={0} y={0} width={s} height={s} patternUnits="userSpaceOnUse">
            {/* Diamond lattice: two diagonals cross within the tile */}
            <Path
              d={`M 0 ${s / 2} L ${s / 2} 0 L ${s} ${s / 2} L ${s / 2} ${s} Z`}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
            />
            {/* Optional inner diamond for subtle complexity */}
            <Path
              d={`M ${s / 4} ${s / 2} L ${s / 2} ${s / 4} L ${(3 * s) / 4} ${s / 2} L ${s / 2} ${(3 * s) / 4} Z`}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              opacity={0.7}
            />
          </Pattern>
        )}
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill="url(#geoPattern)" opacity={opacity} />
    </Svg>
  );
}
