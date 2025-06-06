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
import { fetchEvents } from "../../lib/supabase";

// Initial map region (Stanford University)
const initialRegion = {
  latitude: 37.427619,
  longitude: -122.170732,
  latitudeDelta: 0.015,
  longitudeDelta: 0.0121,
};

interface Event {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  genre?: string;
  attendee_count: number;
}

interface EventMapCluster {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  count: number;
  isHot: boolean;
}

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  // State for map data
  const [events, setEvents] = useState<Event[]>([]);
  const [clusters, setClusters] = useState<EventMapCluster[]>([]);
  const [region, setRegion] = useState<Region>(initialRegion);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch events from Supabase
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchEvents(selectedFilter !== "all" ? selectedFilter : undefined);
        setEvents(data || []);
        
        // Transform events into clusters
        const eventClusters = data?.reduce((acc: { [key: string]: EventMapCluster }, event) => {
          const key = `${event.latitude},${event.longitude}`;
          if (!acc[key]) {
            acc[key] = {
              id: key,
              coordinate: {
                latitude: event.latitude,
                longitude: event.longitude,
              },
              count: 0,
              isHot: false,
            };
          }
          acc[key].count += 1;
          // Consider a cluster "hot" if it has more than 3 events
          acc[key].isHot = acc[key].count > 3;
          return acc;
        }, {}) || {};

        setClusters(Object.values(eventClusters));
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [selectedFilter]);

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

      setLoading(false);
    })();
  }, []);

  // Handle cluster press
  const handleClusterPress = (cluster: EventMapCluster) => {
    // Find all events in this cluster
    const clusterEvents = events.filter(
      event => 
        event.latitude === cluster.coordinate.latitude && 
        event.longitude === cluster.coordinate.longitude
    );
    
    // Navigate to cluster details with the events
    router.push({
      pathname: "/cluster/[id]",
      params: { 
        id: cluster.id,
        events: JSON.stringify(clusterEvents)
      }
    });
  };

  // Handle filter selection
  const handleFilterPress = (filterId: string) => {
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
        {/* Event Cluster Markers */}
        {clusters.map((cluster) => (
          <MapMarker
            key={cluster.id}
            cluster={cluster}
            onPress={handleClusterPress}
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
