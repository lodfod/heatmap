import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { getEventsWithLocation, musicGenres } from "../../data/events";
import { useColorScheme } from "../../hooks/useColorScheme";
import { Event } from "../../lib/supabase";

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

// Add zoom level thresholds for clustering
const ZOOM_THRESHOLDS = {
  VERY_FAR: 0.02, // > 0.02 delta = very far out, large clusters (500m radius)
  FAR: 0.01, // 0.01-0.02 delta = far, medium clusters (200m radius)
  MEDIUM: 0.005, // 0.005-0.01 delta = medium, small clusters (100m radius)
  CLOSE: 0.002, // 0.002-0.005 delta = close, tiny clusters (50m radius)
  VERY_CLOSE: 0.001, // < 0.001 delta = very close, no clustering (individual events)
};

// Function to get clustering radius based on zoom level
function getClusterRadiusForZoom(latitudeDelta: number): number {
  if (latitudeDelta > ZOOM_THRESHOLDS.VERY_FAR) return 500;
  if (latitudeDelta > ZOOM_THRESHOLDS.FAR) return 200;
  if (latitudeDelta > ZOOM_THRESHOLDS.MEDIUM) return 100;
  if (latitudeDelta > ZOOM_THRESHOLDS.CLOSE) return 50;
  if (latitudeDelta > ZOOM_THRESHOLDS.VERY_CLOSE) return 25;
  return 0; // No clustering at very close zoom
}

// Haversine distance calculation
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

// Improved clustering algorithm that properly handles re-clustering
function clusterEvents(
  events: Event[],
  clusterRadius: number = 100
): EventCluster[] {
  if (!events || events.length === 0) {
    return [];
  }

  // If cluster radius is 0, return each event as its own cluster
  if (clusterRadius === 0) {
    return events.map((event) => ({
      id: `individual_${event.id}`,
      events: [event],
      centerLatitude: event.latitude,
      centerLongitude: event.longitude,
      isHot: event.is_hot || false,
    }));
  }

  const clusters: EventCluster[] = [];
  const processedEvents = new Set<string>();

  // Create a fresh copy of events to avoid mutations
  const eventsCopy = [...events];

  eventsCopy.forEach((event) => {
    if (processedEvents.has(event.id)) return;

    const nearbyEvents = [event];
    processedEvents.add(event.id);

    // Find all nearby events for this cluster
    eventsCopy.forEach((otherEvent) => {
      if (otherEvent.id !== event.id && !processedEvents.has(otherEvent.id)) {
        const distance = getDistance(
          event.latitude,
          event.longitude,
          otherEvent.latitude,
          otherEvent.longitude
        );

        if (distance <= clusterRadius) {
          nearbyEvents.push(otherEvent);
          processedEvents.add(otherEvent.id);
        }
      }
    });

    // Calculate cluster center (average of all event coordinates)
    const totalLat = nearbyEvents.reduce((sum, e) => sum + e.latitude, 0);
    const totalLng = nearbyEvents.reduce((sum, e) => sum + e.longitude, 0);
    const centerLatitude = totalLat / nearbyEvents.length;
    const centerLongitude = totalLng / nearbyEvents.length;

    // Create the cluster
    const cluster: EventCluster = {
      id: `cluster_${
        nearbyEvents.length > 1 ? centerLatitude.toFixed(6) : event.id
      }`,
      events: nearbyEvents,
      centerLatitude,
      centerLongitude,
      isHot: nearbyEvents.some((e) => e.is_hot) || nearbyEvents.length >= 3,
    };

    clusters.push(cluster);
  });

  console.log("🔗 Event clustering complete:", {
    originalEvents: events.length,
    clusters: clusters.length,
    clusterRadius: clusterRadius,
    averageClusterSize:
      clusters.length > 0 ? (events.length / clusters.length).toFixed(1) : 0,
  });

  return clusters;
}

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();

  // State management
  const [events, setEvents] = useState<Event[]>([]);
  const [eventClusters, setEventClusters] = useState<EventCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region>(initialRegion);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [locationPermission, setLocationPermission] = useState<boolean | null>(
    null
  );

  const mapRef = useRef<MapView>(null);
  const regionChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced function to recalculate clusters
  const recalculateClusters = useCallback(
    (newRegion: Region, eventsData: Event[]) => {
      try {
        if (!eventsData || eventsData.length === 0) {
          setEventClusters([]);
          return;
        }

        const clusterRadius = getClusterRadiusForZoom(newRegion.latitudeDelta);
        console.log(
          `🔍 Recalculating clusters - zoom: ${newRegion.latitudeDelta.toFixed(
            4
          )}, radius: ${clusterRadius}m`
        );

        const newClusters = clusterEvents(eventsData, clusterRadius);
        setEventClusters(newClusters);
      } catch (error) {
        console.error("❌ Error recalculating clusters:", error);
      }
    },
    []
  );

  // Debounced region change handler to prevent crashes
  const handleRegionChangeComplete = useCallback(
    (newRegion: Region) => {
      // Clear any existing timeout
      if (regionChangeTimeoutRef.current) {
        clearTimeout(regionChangeTimeoutRef.current);
      }

      // Update region immediately for map display
      setRegion(newRegion);

      // Debounce cluster recalculation to prevent performance issues
      regionChangeTimeoutRef.current = setTimeout(() => {
        recalculateClusters(newRegion, events);
      }, 300); // 300ms debounce
    },
    [events, recalculateClusters]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (regionChangeTimeoutRef.current) {
        clearTimeout(regionChangeTimeoutRef.current);
      }
    };
  }, []);

  // Initialize map and load events
  useEffect(() => {
    (async () => {
      console.log("🗺️ MapScreen: Starting initialization...");

      // Request location permissions
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status === "granted");

        if (status === "granted") {
          console.log("📍 Location permission granted");
        } else {
          console.log("❌ Location permission denied");
        }
      } catch (error) {
        console.log("❌ Error requesting location permission:", error);
        setLocationPermission(false);
      }

      // Fetch events from database using our new simplified function
      try {
        console.log(
          "🔍 Fetching events with location data for filter:",
          selectedFilter
        );

        const fetchedEvents = await getEventsWithLocation(selectedFilter);

        console.log("✅ Events fetched:", {
          count: fetchedEvents?.length || 0,
        });

        setEvents(fetchedEvents);

        // Create initial clusters based on current zoom level
        if (fetchedEvents.length > 0) {
          await recalculateClusters(region, fetchedEvents);
        }
      } catch (error) {
        console.error("❌ Error fetching events:", error);
        setEvents([]);
        setEventClusters([]);
      }

      setLoading(false);
      console.log("🏁 MapScreen initialization complete");
    })();
  }, [selectedFilter, recalculateClusters, region]);

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
          const newRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          };
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      } catch (error) {
        console.log("Error getting location:", error);
      }
    }
  };

  // Handle cluster marker press with enhanced behavior
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
      // Multiple events - zoom in to break up the cluster
      console.log(
        "📍 Cluster marker tapped:",
        cluster.id,
        "with",
        cluster.events.length,
        "events"
      );

      if (mapRef.current) {
        // Calculate a smaller region to zoom into the cluster
        const currentRadius = getClusterRadiusForZoom(region.latitudeDelta);
        const zoomFactor = currentRadius > 100 ? 0.4 : 0.5; // Less aggressive zoom for smaller clusters

        const newRegion = {
          latitude: cluster.centerLatitude,
          longitude: cluster.centerLongitude,
          latitudeDelta: region.latitudeDelta * zoomFactor,
          longitudeDelta: region.longitudeDelta * zoomFactor,
        };

        console.log(
          `🔍 Zooming into cluster: ${region.latitudeDelta.toFixed(
            4
          )} -> ${newRegion.latitudeDelta.toFixed(4)}`
        );

        mapRef.current.animateToRegion(newRegion, 1000);
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

      {/* Map Header - more compact */}
      <View style={styles.header}>
        <Text style={[Typography.headingMedium, { color: colors.text }]}>
          Event Map
        </Text>
        <Text
          style={[Typography.caption, { color: colors.icon, marginTop: 2 }]}
        >
          {events.length} events • {eventClusters.length} clusters • Radius:{" "}
          {getClusterRadiusForZoom(region.latitudeDelta)}m
        </Text>
      </View>

      {/* Filter Tabs - much more compact */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {musicGenres.map((genre) => (
          <TouchableOpacity
            key={genre.id}
            style={[
              styles.filterTab,
              selectedFilter === genre.id && {
                backgroundColor: colors.tint,
              },
            ]}
            onPress={() => handleFilterPress(genre.id)}
          >
            <Text
              style={[
                Typography.bodySmall,
                {
                  color: selectedFilter === genre.id ? "#FFF" : colors.text,
                  fontWeight: selectedFilter === genre.id ? "600" : "400",
                },
              ]}
            >
              {genre.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map takes up remaining space */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation={locationPermission || false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        onRegionChangeComplete={handleRegionChangeComplete}
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
    paddingTop: 16,
    paddingBottom: 4, // Reduced from 8
  },
  filterContainer: {
    maxHeight: 44, // Fixed height to prevent expansion
    paddingVertical: 4, // Reduced from 8
  },
  filterContent: {
    paddingHorizontal: 16,
    alignItems: "center", // Center vertically
  },
  filterTab: {
    paddingVertical: 6, // Reduced from 8
    paddingHorizontal: 12, // Reduced from 16
    marginRight: 8,
    borderRadius: 16, // Slightly smaller radius
    backgroundColor: "rgba(0,0,0,0.05)",
    minHeight: 32, // Fixed minimum height
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    flex: 1, // This ensures the map takes up all remaining space
  },
  locationButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
