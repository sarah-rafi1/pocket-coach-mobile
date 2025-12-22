import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface FeedIconProps {
  color?: string;
  size?: number;
}

export default function FeedIcon({ color = '#9CA3AF', size = 24 }: FeedIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"
        fill={color}
      />
      <Path
        d="M19 15L19.91 18.26L23 19L19.91 19.74L19 23L18.09 19.74L15 19L18.09 18.26L19 15Z"
        fill={color}
      />
    </Svg>
  );
}