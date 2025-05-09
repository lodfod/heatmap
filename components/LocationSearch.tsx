import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  VirtualizedList,
} from "react-native";
import { Colors } from "../constants/Colors";
import { Typography } from "../constants/Typography";
import { useColorScheme } from "../hooks/useColorScheme";

// Stanford campus locations with coordinates
const stanfordLocations = [
  {
    name: "Kappa Sigma",
    coordinates: { latitude: 37.427619, longitude: -122.170732 },
    category: "Greek Life",
  },
  {
    name: "Sigma Nu",
    coordinates: { latitude: 37.426583, longitude: -122.169631 },
    category: "Greek Life",
  },
  {
    name: "White Plaza",
    coordinates: { latitude: 37.426975, longitude: -122.169328 },
    category: "Campus Landmark",
  },
  {
    name: "Bing Concert Hall",
    coordinates: { latitude: 37.432501, longitude: -122.166418 },
    category: "Performance Venue",
  },
  {
    name: "Tresidder Union",
    coordinates: { latitude: 37.424125, longitude: -122.166427 },
    category: "Student Center",
  },
  {
    name: "Meyer Green",
    coordinates: { latitude: 37.426054, longitude: -122.168395 },
    category: "Outdoor Space",
  },
  {
    name: "Narnia (Row House)",
    coordinates: { latitude: 37.421952, longitude: -122.164913 },
    category: "Student Housing",
  },
  {
    name: "Toussaint House (Row)",
    coordinates: { latitude: 37.422235, longitude: -122.165611 },
    category: "Student Housing",
  },
  {
    name: "CCRMA",
    coordinates: { latitude: 37.430016, longitude: -122.163778 },
    category: "Academic Building",
  },
  {
    name: "Engineering Quad",
    coordinates: { latitude: 37.429913, longitude: -122.173648 },
    category: "Academic Area",
  },
  {
    name: "Gates Computer Science Building",
    coordinates: { latitude: 37.430215, longitude: -122.173537 },
    category: "Academic Building",
  },
  {
    name: "Huang Engineering Center",
    coordinates: { latitude: 37.428476, longitude: -122.174111 },
    category: "Academic Building",
  },
  {
    name: "Memorial Auditorium",
    coordinates: { latitude: 37.427863, longitude: -122.166746 },
    category: "Performance Venue",
  },
  {
    name: "Old Union",
    coordinates: { latitude: 37.424556, longitude: -122.166805 },
    category: "Student Center",
  },
  {
    name: "Frost Amphitheater",
    coordinates: { latitude: 37.430691, longitude: -122.165925 },
    category: "Performance Venue",
  },
];

export interface LocationData {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  category: string;
}

interface LocationSearchProps {
  onSelectLocation: (location: LocationData) => void;
  initialLocation?: string;
}

export function LocationSearch({
  onSelectLocation,
  initialLocation = "",
}: LocationSearchProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [searchQuery, setSearchQuery] = useState(initialLocation);
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Handle search input change
  const handleSearch = (text: string) => {
    setSearchQuery(text);

    if (text.length > 0) {
      setIsSearching(true);
      setShowResults(true);

      // Filter locations based on search query
      const filteredLocations = stanfordLocations.filter((location) =>
        location.name.toLowerCase().includes(text.toLowerCase())
      );

      setSearchResults(filteredLocations);
      setIsSearching(false);
    } else {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  // Handle location selection
  const handleSelectLocation = (location: LocationData) => {
    setSearchQuery(location.name);
    setShowResults(false);
    onSelectLocation(location);
  };

  // Helper functions for VirtualizedList
  const getItemCount = (data: LocationData[]) => data.length;

  const getItem = (data: LocationData[], index: number) => data[index];

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="location-outline"
          size={20}
          color={colors.icon}
          style={styles.searchIcon}
        />
        <TextInput
          style={[
            styles.searchInput,
            { backgroundColor: colors.cardBackground, color: colors.text },
          ]}
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search for a location"
          placeholderTextColor={colors.icon}
          onFocus={() => {
            if (searchQuery.length > 0) {
              setShowResults(true);
            }
          }}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery("");
              setShowResults(false);
            }}
          >
            <Ionicons name="close-circle" size={20} color={colors.icon} />
          </TouchableOpacity>
        )}
      </View>

      {isSearching && (
        <ActivityIndicator
          size="small"
          color={colors.tint}
          style={styles.loader}
        />
      )}

      {showResults && searchResults.length > 0 && (
        <View
          style={[
            styles.resultsContainer,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          <VirtualizedList
            data={searchResults}
            keyExtractor={(item: LocationData) => item.name}
            getItemCount={getItemCount}
            getItem={getItem}
            renderItem={({ item }: { item: LocationData }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelectLocation(item)}
              >
                <View style={styles.resultContent}>
                  <Text style={[Typography.bodyMedium, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text
                    style={[
                      Typography.caption,
                      { color: colors.icon, marginTop: 2 },
                    ]}
                  >
                    {item.category}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.icon}
                />
              </TouchableOpacity>
            )}
            style={styles.resultsList}
          />
        </View>
      )}

      {showResults &&
        searchResults.length === 0 &&
        !isSearching &&
        searchQuery.length > 0 && (
          <View
            style={[
              styles.resultsContainer,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <Text
              style={[
                Typography.bodyMedium,
                { color: colors.text, textAlign: "center", padding: 16 },
              ]}
            >
              No locations found. Try a different search term.
            </Text>
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 8,
    height: 50,
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    paddingLeft: 40,
    paddingRight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  clearButton: {
    position: "absolute",
    right: 12,
    zIndex: 1,
  },
  loader: {
    marginVertical: 8,
  },
  resultsContainer: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  resultContent: {
    flex: 1,
  },
});
