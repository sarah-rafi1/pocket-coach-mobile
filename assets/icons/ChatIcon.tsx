import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface ChatIconProps {
  color?: string;
  size?: number;
}

export default function ChatIcon({ color = '#9CA3AF', size = 24 }: ChatIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM6 9V7H18V9H6ZM14 14V12H18V14H14ZM6 14V12H12V14H6Z"
        fill={color}
      />
    </Svg>
  );
}