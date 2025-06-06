import React from "react";
import { View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

export interface LocationData {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  category: string;
}

interface Props {
  onSelectLocation: (location: LocationData) => void;
  initialLocation?: string;
}

export const LocationSearch: React.FC<Props> = ({
  onSelectLocation,
  initialLocation = "",
}) => {
  return (
    <View style={{ flex: 1 }}>
      <GooglePlacesAutocomplete
  placeholder="Search for a location"
  minLength={2}
  fetchDetails={true}
  query={{
    key: "YOUR_GOOGLE_MAPS_API_KEY",
    language: "en",
  }}
  textInputProps={{
    defaultValue: initialLocation,
  }}
  onPress={(data, details = null) => {
    if (details) {
      const locationData: LocationData = {
        name: data.description,
        category: "Google Place",
        coordinates: {
          latitude: details.geometry.location.lat,
          longitude: details.geometry.location.lng,
        },
      };
      onSelectLocation(locationData);
    }
  }}
  styles={{
    textInput: {
      height: 50,
      borderColor: "#ccc",
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 16,
    },
  }}
/>

    </View>
  );
};


{/*
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { Typography } from "../constants/Typography";
import { useColorScheme } from "../hooks/useColorScheme";

export interface LocationData {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  category: string;
}

interface LocationSearchProps {
  locations: LocationData[]; // ✅ Pass locations via props
  onSelectLocation: (location: LocationData) => void;
  initialLocation?: string;
}

export function LocationSearch({
  locations,
  onSelectLocation,
  initialLocation = "",
}: LocationSearchProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [searchQuery, setSearchQuery] = useState(initialLocation);
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (text: string) => {
    setSearchQuery(text);

    if (text.length > 0) {
      setIsSearching(true);
      setShowResults(true);

      const lowercasedQuery = text.toLowerCase();

      const filteredLocations = locations.filter((location) =>
        location.name.toLowerCase().includes(lowercasedQuery) ||
        location.category.toLowerCase().includes(lowercasedQuery)
      );

      setSearchResults(filteredLocations);
      setIsSearching(false);
    } else {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  const handleSelectLocation = (location: LocationData) => {
    setSearchQuery(location.name);
    setShowResults(false);
    onSelectLocation(location);
  };

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
          <ScrollView style={styles.resultsList}>
            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.name}
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
                <Ionicons name="chevron-forward" size={16} color={colors.icon} />
              </TouchableOpacity>
            ))}
          </ScrollView>
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
    zIndex: 1,
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
    zIndex: 999,
    elevation: 10,
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
*/}