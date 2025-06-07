import "react-native-get-random-values";
import "../polyfills"; // Import polyfills first

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Session } from "@supabase/supabase-js";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Import our custom fonts
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";

import Auth from "../components/Auth";
import { Colors } from "../constants/Colors";
import { useColorScheme } from "../hooks/useColorScheme";
import { supabase } from "../lib/supabase";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const [session, setSession] = useState<Session | null>(null);
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // Set up auth state listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Hide the splash screen once the fonts have loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Prevent rendering until the font has loaded or error occurred
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Show auth screen if not authenticated
  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SafeAreaProvider>
          <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
          >
            <Auth />
            <StatusBar
              style={colorScheme === "dark" ? "light" : "dark"}
              backgroundColor={colors.background}
            />
          </ThemeProvider>
        </SafeAreaProvider>
      </View>
    );
  }

  // Show main app if authenticated
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar
            style={colorScheme === "dark" ? "light" : "dark"}
            backgroundColor={colors.background}
          />
        </ThemeProvider>
      </SafeAreaProvider>
    </View>
  );
}
