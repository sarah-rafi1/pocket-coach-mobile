import React from 'react';
import Svg, { ClipPath, Defs, Filter, G, LinearGradient, Path, Rect, Stop, FeFlood, FeBlend, FeGaussianBlur } from 'react-native-svg';

const BackgroundSvg = () => {
  return(
<Svg width="375" height="812" viewBox="0 0 375 812" fill="none">
<G clipPath="url(#clip0_514_7710)">
<Rect width="375" height="812" fill="#0D1117"/>
<G filter="url(#filter0_f_514_7710)">
<Rect x="218" y="35" width="195" height="195" rx="97.5" fill="url(#paint0_linear_514_7710)"/>
</G>
</G>
<Defs>
<Filter id="filter0_f_514_7710" x="-96" y="-279" width="823" height="823" filterUnits="userSpaceOnUse">
<FeFlood floodOpacity="0" result="BackgroundImageFix"/>
<FeBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<FeGaussianBlur stdDeviation="157" result="effect1_foregroundBlur_514_7710"/>
</Filter>
<LinearGradient id="paint0_linear_514_7710" x1="218" y1="132.5" x2="413" y2="132.5" gradientUnits="userSpaceOnUse">
<Stop stopColor="#00C6FF"/>
<Stop offset="1" stopColor="#0072FF"/>
</LinearGradient>
<ClipPath id="clip0_514_7710">
<Rect width="375" height="812" fill="white"/>
</ClipPath>
</Defs>
</Svg>
  )
}
export default BackgroundSvg;