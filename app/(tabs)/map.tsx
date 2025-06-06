import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import { MapMarker } from "../../components/MapMarker";
import { Colors } from "../../constants/Colors";
import { Typography } from "../../constants/Typography";
import { musicGenres } from "../../data/events";
import { useColorScheme } from "../../hooks/useColorScheme";
import { Event, fetchEventsWithLocation } from "../../lib/supabase";

// Initial map region (Stanford University)
const initialRegion = {
  latitude: 37.427619,
  longitude: -122.170732,
  latitudeDelta: 0.015,
  longitudeDelta: 0.0121,
};

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  // State for map data
  const [events, setEvents] = useState<Event[]>([]);
  const [region, setRegion] = useState<Region>(initialRegion);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch events from Supabase
  const fetchEvents = async (genre?: string) => {
    try {
      const data = await fetchEventsWithLocation(genre);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Request location permission and get current location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === "granted");

      if (status === "granted") {
        try {
          const location = await Location.getCurrentPositionAsync({});
          setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          });
        } catch (error) {
          console.log("Error getting location:", error);
        }
      }

      // Fetch initial events
      await fetchEvents();
      setLoading(false);
    })();
  }, []);

  // Handle event press
  const handleEventPress = (event: Event) => {
    router.push(`/event/${event.id}`);
  };

  // Handle filter selection
  const handleFilterPress = async (filterId: string) => {
    setSelectedFilter(filterId);
    await fetchEvents(filterId);
  };

  // Go to user location
  const goToUserLocation = async () => {
    if (locationPermission) {
      try {
        const location = await Location.getCurrentPositionAsync({});

        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
            },
            1000
          );
        }
      } catch (error) {
        console.log("Error getting location:", error);
      }
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
        <Text
          style={[Typography.bodyMedium, { color: colors.text, marginTop: 16 }]}
        >
          Loading map...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {/* Map Header */}
      <View style={styles.header}>
        <Text style={[Typography.headingMedium, { color: colors.text }]}>
          Event Map
        </Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {musicGenres.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterOption,
                {
                  backgroundColor:
                    selectedFilter === filter.id
                      ? colors.tint
                      : colors.cardBackground,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleFilterPress(filter.id)}
            >
              <Text
                style={[
                  Typography.bodySmall,
                  {
                    color: selectedFilter === filter.id ? "#FFF" : colors.text,
                  },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={locationPermission || false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        onRegionChangeComplete={setRegion}
      >
        {/* Event Markers */}
        {events.map((event) => (
          <MapMarker
            key={event.id}
            event={event}
            onPress={() => handleEventPress(event)}
          />
        ))}
      </MapView>

      {/* Current Location Button */}
      {locationPermission && (
        <TouchableOpacity
          style={[
            styles.locationButton,
            { backgroundColor: colors.cardBackground },
          ]}
          onPress={goToUserLocation}
        >
          <Ionicons name="locate" size={24} color={colors.tint} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 8,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterScrollContent: {
    paddingRight: 16,
  },
  filterOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  map: {
    flex: 1,
  },
  locationButton: {
    position: "absolute",
    bottom: 30,
    right: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
});
