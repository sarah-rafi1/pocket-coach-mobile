import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface ProfileIconProps {
  color?: string;
  size?: number;
}

export default function ProfileIcon({ color = '#9CA3AF', size = 24 }: ProfileIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
        fill={color}
      />
      <Path
        d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z"
        fill={color}
      />
    </Svg>
  );
}