import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
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
}

export function MapMarker({ event, onPress }: MapMarkerProps) {
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
      <Ionicons
        name={event.is_hot ? "flame" : "location"}
        size={24}
        color={event.is_hot ? colors.tint : colors.text}
      />
    </Marker>
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
