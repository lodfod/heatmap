import { StyleSheet } from "react-native";

/**
 * Typography styles for the app
 * Using Playfair Display for headings (serif) and Inter for body text (sans-serif)
 */
export const Typography = StyleSheet.create({
  // Headings - using Playfair Display (serif)
  headingHero: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  headingLarge: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 32,
    lineHeight: 38,
  },
  headingMedium: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 24,
    lineHeight: 32,
  },
  headingSmall: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 20,
    lineHeight: 28,
  },

  // Body text - using Inter (sans-serif)
  bodyLarge: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    lineHeight: 28,
  },
  bodyMedium: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },

  // Caption text
  caption: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },

  // Button text
  buttonLarge: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  buttonMedium: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0.5,
  },
  buttonSmall: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.5,
  },

  // Special cases
  eventTitle: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.25,
  },
  eventDate: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.4,
  },
  eventLocation: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
});
