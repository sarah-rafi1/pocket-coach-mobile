import React from 'react';
import Svg, { ClipPath, Defs, Filter, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

const BackArrow = () => {
  return(
<Svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
<Path fill-rule="evenodd" clip-rule="evenodd" d="M18.4881 7.43057C18.8026 7.70014 18.839 8.17361 18.5694 8.48811L12.9878 15L18.5694 21.5119C18.839 21.8264 18.8026 22.2999 18.4881 22.5695C18.1736 22.839 17.7001 22.8026 17.4306 22.4881L11.4306 15.4881C11.1898 15.2072 11.1898 14.7928 11.4306 14.5119L17.4306 7.51192C17.7001 7.19743 18.1736 7.161 18.4881 7.43057Z" fill="url(#paint0_linear_120_47056)"/>
<Defs>
<LinearGradient id="paint0_linear_120_47056" x1="11.25" y1="15" x2="18.75" y2="15" gradientUnits="userSpaceOnUse">
<Stop stopColor="#00C6FF"/>
<Stop offset="1" stopColor="#0072FF"/>
</LinearGradient>
</Defs>
</Svg>
  )
}
export default BackArrow;