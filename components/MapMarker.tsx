import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { Marker } from "react-native-maps";
import { Colors } from "../constants/Colors";
import { useColorScheme } from "../hooks/useColorScheme";
import { Event } from "../lib/supabase";

/**
 * Component props
 */
interface MapMarkerProps {
  event: Event;
  onPress: () => void;
  clustered?: boolean;
  clusterCount?: number;
}

export function MapMarker({
  event,
  onPress,
  clustered = false,
  clusterCount = 1,
}: MapMarkerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  // Calculate cluster size based on event count
  const getClusterSize = (count: number) => {
    if (count <= 2) return { size: 50, fontSize: 16 };
    if (count <= 5) return { size: 65, fontSize: 18 };
    if (count <= 10) return { size: 80, fontSize: 20 };
    if (count <= 20) return { size: 95, fontSize: 22 };
    return { size: 110, fontSize: 24 };
  };

  const { size, fontSize } = getClusterSize(clusterCount);

  return (
    <Marker
      coordinate={{
        latitude: event.latitude,
        longitude: event.longitude,
      }}
      onPress={onPress}
    >
      {clustered && clusterCount > 1 ? (
        // Cluster marker - much bigger and more prominent
        <View style={styles.clusterContainer}>
          {/* Outer glow ring */}
          <View
            style={[
              styles.clusterGlow,
              {
                width: size + 20,
                height: size + 20,
                borderRadius: (size + 20) / 2,
                backgroundColor: event.is_hot ? colors.tint : colors.accent1,
                opacity: 0.3,
              },
            ]}
          />

          {/* Main cluster marker */}
          <View
            style={[
              styles.clusterMarker,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: event.is_hot
                  ? colors.tint
                  : colors.cardBackground,
                borderColor: event.is_hot ? "#FFF" : colors.border,
                borderWidth: event.is_hot ? 3 : 2,
              },
            ]}
          >
            {/* Inner content */}
            <Text
              style={[
                styles.clusterText,
                {
                  fontSize: fontSize,
                  color: event.is_hot ? "#FFF" : colors.text,
                  fontWeight: "700",
                },
              ]}
            >
              {clusterCount}
            </Text>

            {/* Small icon indicator */}
            <Ionicons
              name={event.is_hot ? "flame" : "musical-notes"}
              size={Math.max(12, fontSize - 8)}
              color={event.is_hot ? "#FFF" : colors.text}
              style={{ marginTop: -2 }}
            />
          </View>

          {/* Pulse animation ring for hot events */}
          {event.is_hot && (
            <View
              style={[
                styles.pulseRing,
                {
                  width: size + 30,
                  height: size + 30,
                  borderRadius: (size + 30) / 2,
                  borderColor: colors.tint,
                },
              ]}
            />
          )}
        </View>
      ) : (
        // Individual event marker - enhanced styling
        <View style={styles.individualContainer}>
          {/* Glow effect for individual markers */}
          <View
            style={[
              styles.individualGlow,
              {
                backgroundColor: event.is_hot ? colors.tint : colors.accent1,
                opacity: 0.4,
              },
            ]}
          />

          <View
            style={[
              styles.individualMarker,
              {
                backgroundColor: event.is_hot
                  ? colors.tint
                  : colors.cardBackground,
                borderColor: event.is_hot ? "#FFF" : colors.border,
                borderWidth: event.is_hot ? 2 : 1,
              },
            ]}
          >
            <Ionicons
              name={event.is_hot ? "flame" : "musical-note"}
              size={18}
              color={event.is_hot ? "#FFF" : colors.text}
            />
          </View>
        </View>
      )}
    </Marker>
  );
}

const styles = StyleSheet.create({
  clusterContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  clusterGlow: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  clusterMarker: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  clusterText: {
    fontWeight: "700",
    textAlign: "center",
  },
  pulseRing: {
    position: "absolute",
    borderWidth: 2,
    opacity: 0.6,
  },
  individualContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  individualGlow: {
    position: "absolute",
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  individualMarker: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
});
