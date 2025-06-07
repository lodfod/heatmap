import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HapticTab } from "../../components/HapticTab";
import { IconSymbol } from "../../components/ui/IconSymbol";
import TabBarBackground from "../../components/ui/TabBarBackground";
import { Colors } from "../../constants/Colors";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["top", "left", "right"]}
      >
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: colors.tint,
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarBackground: TabBarBackground,
            tabBarStyle: Platform.select({
              ios: {
                // Use a transparent background on iOS to show the blur effect
                position: "absolute",
                backgroundColor: colors.background,
              },
              default: {
                backgroundColor: colors.background,
              },
            }),
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="house.fill" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="map"
            options={{
              title: "Map",
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="map.fill" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="create"
            options={{
              title: "Create",
              tabBarIcon: ({ color }) => (
                <IconSymbol size={32} name="plus.circle.fill" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="discover"
            options={{
              title: "Discover",
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="paperplane.fill" color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color }) => (
                <IconSymbol size={28} name="person.crop.circle" color={color} />
              ),
            }}
          />
        </Tabs>
      </SafeAreaView>
    </View>
  );
}
