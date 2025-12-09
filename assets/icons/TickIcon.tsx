import React from 'react';
import Svg, { Circle, ClipPath, Defs, Filter, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

const TickIcon = () => {
  return(
<Svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
<Circle cx="50" cy="50" r="49.5" stroke="url(#paint0_linear_120_47182)" stroke-opacity="0.04"/>
<Circle cx="50" cy="50" r="37.5" stroke="url(#paint1_linear_120_47182)" stroke-opacity="0.14"/>
<Circle cx="50.46" cy="50.4599" r="24.46" fill="url(#paint2_linear_120_47182)"/>
<Path d="M39.3281 50.8886L47.3151 57.8772L60.793 42.4025" stroke="white" stroke-width="3.19478" stroke-linecap="round"/>
<Defs>
<LinearGradient id="paint0_linear_120_47182" x1="0" y1="50" x2="100" y2="50" gradientUnits="userSpaceOnUse">
<Stop stop-color="#1AC5E5"/>
<Stop offset="1" stop-color="#2772E1"/>
</LinearGradient>
<LinearGradient id="paint1_linear_120_47182" x1="12" y1="50" x2="88" y2="50" gradientUnits="userSpaceOnUse">
<Stop stop-color="#1AC5E5"/>
<Stop offset="1" stop-color="#2772E1"/>
</LinearGradient>
<LinearGradient id="paint2_linear_120_47182" x1="26" y1="50.4599" x2="74.92" y2="50.4599" gradientUnits="userSpaceOnUse">
<Stop stop-color="#00C6FF"/>
<Stop offset="1" stop-color="#0072FF"/>
</LinearGradient>
</Defs>
</Svg>
  )
}
export default TickIcon;