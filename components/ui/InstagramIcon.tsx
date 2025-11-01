import React from 'react';
import Svg, { Circle, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

type Props = {
  size?: number;
  style?: any;
};

// A tasteful, original Instagram-style gradient camera icon (not an official logo)
export default function InstagramIcon({ size = 24, style }: Props): React.JSX.Element {
  const s = size;
  const pad = 2;
  const rx = s * 0.18; // rounded rect radius
  const cx = s / 2;
  const cy = s / 2;
  const lensR = s * 0.28;

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={style}>
      <Defs>
        <LinearGradient id="ig_grad" x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0%" stopColor="#feda75" />
          <Stop offset="30%" stopColor="#d62976" />
          <Stop offset="60%" stopColor="#962fbf" />
          <Stop offset="100%" stopColor="#4f5bd5" />
        </LinearGradient>
      </Defs>

      {/* Gradient rounded square */}
      <Rect x={pad} y={pad} width={s - pad * 2} height={s - pad * 2} rx={rx} fill="url(#ig_grad)" />

      {/* Camera lens */}
      <Circle cx={cx} cy={cy} r={lensR} stroke="white" strokeWidth={s * 0.085} fill="none" />

      {/* Small flash dot (top right) */}
      <Circle cx={s * 0.73} cy={s * 0.27} r={s * 0.07} fill="white" />
    </Svg>
  );
}
