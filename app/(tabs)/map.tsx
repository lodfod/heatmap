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

// Interface for clustered events
interface EventCluster {
  id: string;
  events: Event[];
  centerLatitude: number;
  centerLongitude: number;
  isHot: boolean;
}

// Function to calculate distance between two coordinates (Haversine formula)
function getDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Function to cluster nearby events
function clusterEvents(
  events: Event[],
  clusterRadius: number = 100
): EventCluster[] {
  const clusters: EventCluster[] = [];
  const processedEvents = new Set<string>();

  events.forEach((event) => {
    if (processedEvents.has(event.id)) return;

    const cluster: EventCluster = {
      id: `cluster_${event.id}`,
      events: [event],
      centerLatitude: event.latitude,
      centerLongitude: event.longitude,
      isHot: event.is_hot,
    };

    // Find nearby events to cluster together
    events.forEach((otherEvent) => {
      if (otherEvent.id !== event.id && !processedEvents.has(otherEvent.id)) {
        const distance = getDistance(
          event.latitude,
          event.longitude,
          otherEvent.latitude,
          otherEvent.longitude
        );

        if (distance <= clusterRadius) {
          cluster.events.push(otherEvent);
          processedEvents.add(otherEvent.id);
        }
      }
    });

    // Calculate cluster center (average of all event coordinates)
    if (cluster.events.length > 1) {
      const totalLat = cluster.events.reduce((sum, e) => sum + e.latitude, 0);
      const totalLng = cluster.events.reduce((sum, e) => sum + e.longitude, 0);
      cluster.centerLatitude = totalLat / cluster.events.length;
      cluster.centerLongitude = totalLng / cluster.events.length;
    }

    // Mark as hot if any event in cluster is hot or if cluster has many events
    cluster.isHot =
      cluster.events.some((e) => e.is_hot) || cluster.events.length >= 3;

    clusters.push(cluster);
    processedEvents.add(event.id);
  });

  console.log("🔗 Event clustering complete:", {
    originalEvents: events.length,
    clusters: clusters.length,
    clusterSummary: clusters.map((c) => ({
      id: c.id,
      eventCount: c.events.length,
      isHot: c.isHot,
      center: { lat: c.centerLatitude, lng: c.centerLongitude },
    })),
  });

  return clusters;
}

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  // State for map data
  const [events, setEvents] = useState<Event[]>([]);
  const [eventClusters, setEventClusters] = useState<EventCluster[]>([]);
  const [region, setRegion] = useState<Region>(initialRegion);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [locationPermission, setLocationPermission] = useState<boolean | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Request location permission and get current location
  useEffect(() => {
    (async () => {
      console.log("🗺️ MapScreen: Starting initialization...");

      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === "granted");

      if (status === "granted") {
        try {
          const location = await Location.getCurrentPositionAsync({});
          console.log("📍 User location found:", {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          });
        } catch (error) {
          console.log("❌ Error getting location:", error);
        }
      }

      // Fetch events from Supabase
      try {
        console.log(
          "🔍 Fetching events with location data for filter:",
          selectedFilter
        );

        const fetchedEvents = await fetchEventsWithLocation(
          selectedFilter === "all" ? undefined : selectedFilter
        );

        console.log("✅ Raw events fetched from database:", {
          count: fetchedEvents?.length || 0,
          events:
            fetchedEvents?.map((event) => ({
              id: event.id,
              title: event.title,
              latitude: event.latitude,
              longitude: event.longitude,
              genre: event.genre,
              is_hot: event.is_hot,
              event_count: event.event_count,
            })) || [],
        });

        // Validate events have required location data
        const validEvents = (fetchedEvents || []).filter((event) => {
          const hasValidCoords =
            event.latitude != null &&
            event.longitude != null &&
            !isNaN(event.latitude) &&
            !isNaN(event.longitude);

          if (!hasValidCoords) {
            console.log("⚠️ Event missing valid coordinates:", {
              id: event.id,
              title: event.title,
              latitude: event.latitude,
              longitude: event.longitude,
            });
          }

          return hasValidCoords;
        });

        console.log("✅ Valid events with coordinates:", {
          validCount: validEvents.length,
          totalCount: fetchedEvents?.length || 0,
          validEvents: validEvents.map((event) => ({
            id: event.id,
            title: event.title,
            coordinates: { lat: event.latitude, lng: event.longitude },
            genre: event.genre,
          })),
        });

        setEvents(validEvents);

        // Create clusters for heatmap visualization
        const clusters = clusterEvents(validEvents, 100); // 100 meter clustering radius
        setEventClusters(clusters);
      } catch (error) {
        console.error("❌ Error fetching events:", error);
        setEvents([]);
        setEventClusters([]);
      }

      setLoading(false);
      console.log("🏁 MapScreen initialization complete");
    })();
  }, [selectedFilter]);

  // Handle filter selection
  const handleFilterPress = (filterId: string) => {
    console.log("🎛️ Filter changed from", selectedFilter, "to", filterId);
    setSelectedFilter(filterId);
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

  // Handle cluster marker press
  const handleClusterPress = (cluster: EventCluster) => {
    if (cluster.events.length === 1) {
      // Single event - go to event detail
      console.log(
        "📍 Single event marker tapped:",
        cluster.events[0].id,
        cluster.events[0].title
      );
      router.push(`/event/${cluster.events[0].id}`);
    } else {
      // Multiple events - zoom into cluster or show list
      console.log(
        "📍 Cluster marker tapped:",
        cluster.id,
        "with",
        cluster.events.length,
        "events"
      );

      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: cluster.centerLatitude,
            longitude: cluster.centerLongitude,
            latitudeDelta: 0.005, // Zoom in closer
            longitudeDelta: 0.005,
          },
          1000
        );
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
        <Text
          style={[Typography.caption, { color: colors.icon, marginTop: 4 }]}
        >
          {events.length} events in {eventClusters.length} clusters
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
        {/* Clustered Event Markers */}
        {eventClusters.map((cluster) => {
          // Use the first event as representative for marker display
          const representativeEvent: Event = {
            ...cluster.events[0],
            latitude: cluster.centerLatitude,
            longitude: cluster.centerLongitude,
            is_hot: cluster.isHot,
          };

          return (
            <MapMarker
              key={cluster.id}
              event={representativeEvent}
              clustered={cluster.events.length > 1}
              clusterCount={cluster.events.length}
              onPress={() => handleClusterPress(cluster)}
            />
          );
        })}
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
