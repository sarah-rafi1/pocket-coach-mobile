import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface GroupsIconProps {
  color?: string;
  size?: number;
}

export default function GroupsIcon({ color = '#9CA3AF', size = 24 }: GroupsIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 4C18.2091 4 20 5.79086 20 8C20 10.2091 18.2091 12 16 12C13.7909 12 12 10.2091 12 8C12 5.79086 13.7909 4 16 4Z"
        fill={color}
      />
      <Path
        d="M8 6C9.65685 6 11 7.34315 11 9C11 10.6569 9.65685 12 8 12C6.34315 12 5 10.6569 5 9C5 7.34315 6.34315 6 8 6Z"
        fill={color}
      />
      <Path
        d="M15 14C17.7614 14 20 16.2386 20 19V20H12V19C12 16.2386 14.2386 14 15 14H15Z"
        fill={color}
      />
      <Path
        d="M8 14C10.2091 14 12 15.7909 12 18V19H4V18C4 15.7909 5.79086 14 8 14Z"
        fill={color}
      />
    </Svg>
  );
}