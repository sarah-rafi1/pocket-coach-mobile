# Responsive Design Guidelines

Best practices for responsive design using NativeWind v4 in React Native.

## Why NativeWind v4?

We use **NativeWind v4** instead of libraries like `react-native-size-matters` because:
- Built-in responsive utility classes
- Zero runtime overhead (compiled at build time)
- Better TypeScript support
- Works across web/mobile consistently
- Industry standard for 2025

**No additional responsiveness libraries needed.**

---

## 1. Platform-Specific Modifiers

### Supported Modifiers

NativeWind supports: `ios:`, `android:`, `web:`, `windows:`, `osx:`, `native:`

**Official Documentation:**
- [NativeWind Platform Differences](https://www.nativewind.dev/docs/core-concepts/differences)
- [NativeWind Quirks](https://www.nativewind.dev/docs/core-concepts/quirks)

### Usage Examples

```typescript
// Platform-specific padding
<View className="ios:pt-12 android:pt-8 web:pt-6">
  <Text>Content</Text>
</View>

// Platform-specific text size
<Text className="native:text-base web:text-lg">
  Hello World
</Text>

// Use 'native:' for all platforms except web
<Button className="native:rounded-xl web:rounded-lg" />

// Multiple platform modifiers
<View className="ios:bg-blue-500 android:bg-green-500 web:bg-red-500">
  <Text className="ios:text-white android:text-black">Platform Text</Text>
</View>
```

### When to Use Platform Modifiers

✅ **USE platform modifiers for STYLING differences:**
```typescript
// ✅ GOOD - Styling only
<View className="ios:pt-12 android:pt-8">

// ✅ GOOD - Visual differences
<Button className="ios:rounded-2xl android:rounded-lg">

// ✅ GOOD - Spacing adjustments
<Text className="native:mb-4 web:mb-6">
```

❌ **DON'T use platform modifiers for BEHAVIOR:**
```typescript
// ❌ BAD - Can't use className for behavior
// This won't work!
<KeyboardAvoidingView className="ios:behavior-padding android:behavior-height">
```

### When to Use Platform.OS

✅ **USE Platform.OS for BEHAVIORAL differences:**

```typescript
import { Platform } from 'react-native';

// ✅ GOOD - Behavior differs between platforms
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
>

// ✅ GOOD - System APIs behave differently
if (Platform.OS === 'ios') {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
} else {
  // Android haptics
}

// ✅ GOOD - Platform-specific component logic
const headerHeight = Platform.OS === 'ios' ? 88 : 56;

// ✅ GOOD - Platform-specific imports
const ImagePicker = Platform.select({
  ios: () => require('./ImagePicker.ios'),
  android: () => require('./ImagePicker.android'),
})();
```

### Quick Decision Guide

| Scenario | Use | Example |
|----------|-----|---------|
| Different padding/margin | Platform modifiers | `className="ios:pt-12 android:pt-8"` |
| Different colors | Platform modifiers | `className="ios:bg-blue-500 android:bg-green-500"` |
| Different border radius | Platform modifiers | `className="ios:rounded-2xl android:rounded-lg"` |
| Keyboard behavior | Platform.OS | `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` |
| System APIs (Haptics, etc.) | Platform.OS | `if (Platform.OS === 'ios')` |
| Component props | Platform.OS | `keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -100}` |

---

## 2. Accessibility & Font Scaling

### Critical: React Native Font Scaling ≠ Web CSS

React Native respects user's system font size settings. Users with vision impairments may scale fonts **2-4x larger**.

**Official Documentation:**
- [React Native Text - allowFontScaling](https://reactnative.dev/docs/text)
- [Font Scaling Best Practices](https://ignitecookbook.com/docs/recipes/AccessibilityFontSizes/)
- [Responsive Font Scaling](https://dev.to/ikecruz/font-scaling-in-react-native-a-responsive-typography-solution-46j4)

### Best Practices

✅ **ALLOW font scaling with limits:**
```typescript
// ✅ GOOD - Allow scaling but limit to prevent layout breaks
<Text maxFontSizeMultiplier={1.5} className="text-base">
  Scales up to 1.5x user's font size preference
</Text>

// ✅ GOOD - Different limits for different text
<Text maxFontSizeMultiplier={2} className="text-sm">
  Body text - can scale up to 2x
</Text>

<Text maxFontSizeMultiplier={1.3} className="text-xs">
  Small labels - limited scaling to prevent breaking
</Text>
```

❌ **DON'T disable font scaling:**
```typescript
// ❌ BAD - Completely disables accessibility
<Text allowFontScaling={false}>
  Users with vision impairments can't read this
</Text>

// Only disable if absolutely necessary for layout (rare cases)
```

✅ **USE dynamic font scale for custom calculations:**
```typescript
import { useWindowDimensions } from 'react-native';

const { fontScale } = useWindowDimensions();

// ✅ GOOD - Get current font scale and cap it
const scaledSize = 16 * Math.min(fontScale, 2); // Cap at 2x

// Use in custom calculations
const dynamicPadding = 12 * fontScale;
```

### Typography Best Practices

❌ **DON'T define fixed pixel font sizes in Tailwind config:**
```typescript
// ❌ BAD - Ignores user's font scale preference
// tailwind.config.js
fontSize: {
  'base': ['14px', { lineHeight: '20px' }],
  'lg': ['16px', { lineHeight: '24px' }],
}
```

✅ **DO use Tailwind's default rem-based scale:**
```typescript
// ✅ GOOD - Automatically respects fontScale
<Text className="text-sm">12px base, scales with user preference</Text>
<Text className="text-base">14px base, scales with user preference</Text>
<Text className="text-lg">16px base, scales with user preference</Text>
<Text className="text-xl">18px base, scales with user preference</Text>
```

---

## 3. Responsive Breakpoints

### Mobile Context Considerations

⚠️ **Web Tailwind breakpoints don't translate directly to React Native:**

- React Native uses density-independent pixels (dp), not CSS pixels
- `640px` breakpoint means different things on different devices
- Foldables and tablets have varying aspect ratios
- Orientation changes affect layout

### When to Use Breakpoints

Use breakpoints **sparingly** for:
- Tablet vs phone layouts
- Web vs native layouts
- Landscape vs portrait (better: use `useWindowDimensions` hook)

✅ **GOOD breakpoint usage:**
```typescript
// ✅ GOOD - Tablet-specific layout
<View className="flex-col sm:flex-row">
  {/* Stacked on phone, side-by-side on tablet */}
  <View className="flex-1">Column 1</View>
  <View className="flex-1">Column 2</View>
</View>

// ✅ GOOD - Web vs native
<Button className="native:rounded-2xl native:shadow-lg web:rounded-lg web:shadow-md">
  Click Me
</Button>

// ✅ GOOD - Conditional grid columns
<View className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
  {items.map(item => <Item key={item.id} />)}
</View>
```

❌ **BAD breakpoint usage:**
```typescript
// ❌ BAD - Over-reliance on pixel breakpoints for mobile
<Text className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">
  {/* Too many breakpoints for mobile - confusing */}
</Text>

// ❌ BAD - Use fontScale instead
<View className="p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6">
  {/* Just use p-4 and let it scale naturally */}
</View>
```

### Better: Use useWindowDimensions Hook

```typescript
import { useWindowDimensions } from 'react-native';

function MyComponent() {
  const { width, height } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLandscape = width > height;

  return (
    <View className={isTablet ? 'flex-row' : 'flex-col'}>
      {/* More control than breakpoints */}
    </View>
  );
}
```

---

## 4. Spacing Scale

### Extend, Don't Redefine

⚠️ **DON'T override Tailwind's core spacing scale:**

❌ **BAD - Redefines core semantics:**
```javascript
// tailwind.config.js
spacing: {
  '1': '4px',   // ❌ Overrides Tailwind default
  '2': '8px',   // ❌ Confuses contributors
  '4': '16px',  // ❌ Docs online won't match
}
```

✅ **GOOD - Extend with project-specific values:**
```javascript
// tailwind.config.js
extend: {
  spacing: {
    'safe-top': '48px',        // ✅ Custom for iOS safe area
    'safe-bottom': '34px',     // ✅ Custom for iOS safe area
    'tab-bar': '88px',         // ✅ Custom for tab bar height
    'tab-bar-android': '60px', // ✅ Custom for Android tab bar
    'header': '56px',          // ✅ Custom for header height
  }
}
```

### Use Tailwind's Default Scale

These are well-documented and familiar to developers:

| Class | Value | Usage |
|-------|-------|-------|
| `p-1` | 4px (0.25rem) | Tiny padding |
| `p-2` | 8px (0.5rem) | Small padding |
| `p-4` | 16px (1rem) | Standard padding |
| `p-6` | 24px (1.5rem) | Large padding |
| `m-4` | 16px (1rem) | Standard margin |
| `gap-2` | 8px (0.5rem) | Small gap |
| `gap-4` | 16px (1rem) | Standard gap |

**Reference:** [Tailwind Spacing Scale](https://tailwindcss.com/docs/customizing-spacing)

### Example Usage

```typescript
// ✅ GOOD - Use standard scale
<View className="p-4 m-2 gap-3">
  <Text className="mb-2">Title</Text>
  <Text className="mb-4">Description</Text>
</View>

// ✅ GOOD - Use custom project spacing
<View className="pt-safe-top pb-safe-bottom">
  {/* iOS safe area aware */}
</View>

// ✅ GOOD - Combine standard + custom
<View className="px-4 h-tab-bar items-center">
  {/* Standard horizontal, custom height */}
</View>
```

---

## 5. Safe Area Handling

Use `react-native-safe-area-context` for safe areas:

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

// ✅ GOOD - Let library handle safe areas
<SafeAreaView edges={['top', 'bottom']}>
  <View className="flex-1">
    {/* Content automatically respects safe areas */}
  </View>
</SafeAreaView>

// ✅ GOOD - Conditional safe area edges
<SafeAreaView edges={['top']}> {/* Only top */}
  <View className="flex-1">
    {/* Bottom not protected (e.g., for tab bar) */}
  </View>
</SafeAreaView>

// ✅ GOOD - Manual safe area with custom spacing
<View className="pt-safe-top">
  {/* Using custom Tailwind spacing */}
</View>
```

---

## Summary

### DO:
✅ Use platform modifiers for styling (`ios:`, `android:`, `web:`)
✅ Use `Platform.OS` for behavior and APIs
✅ Allow font scaling with `maxFontSizeMultiplier`
✅ Use Tailwind's default spacing scale
✅ Extend Tailwind with project-specific values
✅ Use breakpoints sparingly (tablet/web)
✅ Use `SafeAreaView` for safe areas

### DON'T:
❌ Use platform modifiers for behavior
❌ Disable `allowFontScaling` (accessibility!)
❌ Define fixed pixel font sizes in config
❌ Override Tailwind's core spacing
❌ Over-use breakpoints on mobile
❌ Hardcode safe area values

---

**See also:**
- [CLAUDE.md](../CLAUDE.md) - NativeWind configuration
- [Code Standards](./code-standards.md) - Import conventions
