import React from 'react';
import Svg, { Path, Rect, Circle } from 'react-native-svg';

interface LockPasswordProps {
  color?: string;
}

const LockPassword = ({ color = "white" }: LockPasswordProps) => {
  return(
<Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
<Path d="M7 10V8C7 5.79086 8.79086 4 11 4H13C15.2091 4 17 5.79086 17 8V10" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" fillOpacity="0.5"/>
<Rect x="5" y="10" width="14" height="8" rx="2" stroke={color} strokeWidth="1.5" fill="none" fillOpacity="0.5"/>
<Circle cx="12" cy="14" r="1" fill={color} fillOpacity="0.7"/>
</Svg>


  )
}
export default LockPassword;