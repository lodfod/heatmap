import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import { EventCluster, MapMarker } from "../../components/MapMarker";
import { Colors } from "../../constants/Colors";
import { Typography } from "../../constants/Typography";
import { useColorScheme } from "../../hooks/useColorScheme";

// Mock data for event clusters
const mockEventClusters: EventCluster[] = [
  {
    id: "cluster1",
    coordinate: { latitude: 37.427619, longitude: -122.170732 }, // Stanford campus
    count: 5,
    isHot: true,
  },
  {
    id: "cluster2",
    coordinate: { latitude: 37.429913, longitude: -122.173648 }, // Near Gates building
    count: 3,
    isHot: false,
  },
  {
    id: "cluster3",
    coordinate: { latitude: 37.424125, longitude: -122.166427 }, // Near Engineering Quad
    count: 7,
    isHot: true,
  },
  {
    id: "cluster4",
    coordinate: { latitude: 37.430829, longitude: -122.175038 }, // Near Oval
    count: 2,
    isHot: false,
  },
  {
    id: "cluster5",
    coordinate: { latitude: 37.426737, longitude: -122.169051 }, // Near Memorial Church
    count: 4,
    isHot: true,
  },
];

// Initial map region (Stanford University)
const initialRegion = {
  latitude: 37.427619,
  longitude: -122.170732,
  latitudeDelta: 0.015,
  longitudeDelta: 0.0121,
};

// Event filter options
const filterOptions = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "weekend", label: "Weekend" },
  { id: "academic", label: "Academic" },
  { id: "social", label: "Social" },
];

export default function MapScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  // State for map data
  const [clusters, setClusters] = useState<EventCluster[]>(mockEventClusters);
  const [region, setRegion] = useState<Region>(initialRegion);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [locationPermission, setLocationPermission] = useState<boolean | null>(
    null
  );
  const [loading, setLoading] = useState(true);

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
  const handleClusterPress = (cluster: EventCluster) => {
    router.push(`/cluster/${cluster.id}`);
  };

  // Handle filter selection
  const handleFilterPress = (filterId: string) => {
    setSelectedFilter(filterId);

    // In a real app, this would filter the events based on the selected filter
    // For demo purposes, we'll just randomize the clusters
    if (filterId === "all") {
      setClusters(mockEventClusters);
    } else {
      // Simulate filtered data by randomizing some properties
      const filteredClusters = mockEventClusters.map((cluster) => ({
        ...cluster,
        count: Math.max(1, Math.floor(Math.random() * 10)),
        isHot: Math.random() > 0.5,
      }));

      setClusters(filteredClusters);
    }
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
          {filterOptions.map((filter) => (
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
