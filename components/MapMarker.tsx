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

  return (
    <Marker
      coordinate={{
        latitude: event.latitude,
        longitude: event.longitude,
      }}
      onPress={onPress}
    >
      {clustered && clusterCount > 1 ? (
        // Cluster marker
        <View
          style={[
            styles.clusterMarker,
            {
              backgroundColor: event.is_hot
                ? colors.tint
                : colors.cardBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.clusterText,
              { color: event.is_hot ? "#FFF" : colors.text },
            ]}
          >
            {clusterCount}
          </Text>
        </View>
      ) : (
        // Individual event marker
        <View
          style={[
            styles.individualMarker,
            {
              backgroundColor: event.is_hot
                ? colors.tint
                : colors.cardBackground,
            },
          ]}
        >
          <Ionicons
            name={event.is_hot ? "flame" : "musical-note"}
            size={16}
            color={event.is_hot ? "#FFF" : colors.text}
          />
        </View>
      )}
    </Marker>
  );
}

const styles = StyleSheet.create({
  clusterMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  clusterText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  individualMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
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
