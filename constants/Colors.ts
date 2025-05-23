/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Color palette for our event discovery app
 * Used for consistent theming across light and dark modes
 */

// Main tint colors
const tintColorLight = "#E63946"; // Vibrant red
const tintColorDark = "#F94A6C";

export const Colors = {
  light: {
    text: "#1D3557", // Dark blue for text
    background: "#F1FAEE", // Light mint background
    tint: tintColorLight,
    accent1: "#457B9D", // Medium blue
    accent2: "#A8DADC", // Light blue
    accent3: "#FFB703", // Yellow
    success: "#2A9D8F", // Teal
    warning: "#F4A261", // Orange
    error: "#E76F51", // Coral
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    cardBackground: "#FFFFFF",
    border: "#E5E5E5",
  },
  dark: {
    text: "#F1FAEE", // Light text
    background: "#1D3557", // Dark blue background
    tint: tintColorDark,
    accent1: "#A8DADC", // Light blue
    accent2: "#457B9D", // Medium blue
    accent3: "#FFD166", // Bright yellow
    success: "#2A9D8F", // Teal
    warning: "#F4A261", // Orange
    error: "#E76F51", // Coral
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    cardBackground: "#263B59",
    border: "#364F6B",
  },
};
