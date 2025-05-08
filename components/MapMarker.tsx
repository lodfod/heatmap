import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/Colors";
import { Typography } from "../constants/Typography";
import { useColorScheme } from "../hooks/useColorScheme";

/**
 * Interface for the event cluster data
 */
export interface EventCluster {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  count: number;
  isHot: boolean; // For determining color intensity
}

/**
 * Component props
 */
interface MapMarkerProps {
  cluster: EventCluster;
  onPress: (cluster: EventCluster) => void;
}

export function MapMarker({ cluster, onPress }: MapMarkerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  // Calculate marker size based on event count (min 40, max 70)
  const size = Math.min(70, Math.max(40, 40 + cluster.count * 2));

  // Determine color based on 'hotness'
  const markerColor = cluster.isHot
    ? colors.tint // Hot events
    : colors.accent3; // Regular events

  // Handle marker press
  const handlePress = () => {
    onPress(cluster);
  };

  return (
    <Pressable onPress={handlePress}>
      <View
        style={[
          styles.marker,
          {
            backgroundColor: markerColor,
            width: size,
            height: size,
            borderRadius: size / 2,
            opacity: cluster.isHot ? 1 : 0.7,
          },
        ]}
      >
        {cluster.count > 1 ? (
          <Text style={[Typography.bodyMedium, styles.markerText]}>
            {cluster.count}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  marker: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  markerText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
