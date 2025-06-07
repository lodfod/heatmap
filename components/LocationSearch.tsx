import React, { useRef, useState } from "react";
import { View } from "react-native";
import GooglePlacesTextInput from "react-native-google-places-textinput";
import { Colors } from "../constants/Colors";
import { useColorScheme } from "../hooks/useColorScheme";

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
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const googlePlacesRef = useRef<any>(null);
  const [selectionMade, setSelectionMade] = useState(false);

  const fetchPlaceDetails = async (placeId: string) => {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry,formatted_address,types&key=${apiKey}`
      );

      const data = await response.json();
      console.log("📍 Place details response:", data);

      if (
        data.result &&
        data.result.geometry &&
        data.result.geometry.location
      ) {
        return {
          name: data.result.name || data.result.formatted_address || "",
          coordinates: {
            latitude: data.result.geometry.location.lat,
            longitude: data.result.geometry.location.lng,
          },
          category: data.result.types?.[0] || "place",
        };
      }

      throw new Error("No geometry data found");
    } catch (error) {
      console.error("❌ Error fetching place details:", error);
      throw error;
    }
  };

  const handlePlaceSelect = async (place: any) => {
    console.log("🔍 Selected place raw data:", place);

    try {
      let locationData: LocationData;

      // Check if we have coordinates directly (unlikely with current response format)
      if (place && place.geometry && place.geometry.location) {
        locationData = {
          name:
            place.description || place.name || place.formatted_address || "",
          coordinates: {
            latitude:
              typeof place.geometry.location.lat === "function"
                ? place.geometry.location.lat()
                : place.geometry.location.lat,
            longitude:
              typeof place.geometry.location.lng === "function"
                ? place.geometry.location.lng()
                : place.geometry.location.lng,
          },
          category: place.types?.[0] || "place",
        };
      }
      // If we only have placeId, fetch full details
      else if (place && place.placeId) {
        locationData = await fetchPlaceDetails(place.placeId);
        // Use the display text from the original selection
        locationData.name =
          place.text?.text ||
          place.structuredFormat?.mainText?.text ||
          locationData.name;
      }
      // Handle alternative formats
      else if (place && place.lat && place.lng) {
        locationData = {
          name:
            place.description || place.name || place.formatted_address || "",
          coordinates: {
            latitude: place.lat,
            longitude: place.lng,
          },
          category: place.types?.[0] || "place",
        };
      } else {
        // console.error("❌ Unable to extract location data from place:", place);
        return;
      }

      console.log("✅ Processed location data:", locationData);
      onSelectLocation(locationData);
      setSelectionMade(true);
    } catch (error) {
      // console.error("❌ Error processing place selection:", error);
      // You might want to show an alert to the user here
    }
  };

  const customStyles = {
    container: {
      width: "100%",
      marginHorizontal: 0,
      zIndex: 1000,
    },
    input: {
      height: 45,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      backgroundColor: colors.cardBackground,
      color: colors.text,
      paddingHorizontal: 16,
    },
    suggestionsContainer: {
      backgroundColor: colors.cardBackground,
      maxHeight: 200,
      borderWidth: 1,
      borderColor: colors.border,
      borderTopWidth: 0,
      borderBottomLeftRadius: 8,
      borderBottomRightRadius: 8,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    suggestionItem: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    suggestionText: {
      main: {
        fontSize: 16,
        color: colors.text,
      },
      secondary: {
        fontSize: 14,
        color: colors.icon,
      },
    },
    loadingIndicator: {
      color: colors.icon,
    },
    placeholder: {
      color: colors.icon,
    },
  };

  return (
    <View style={{ width: "100%", zIndex: 1000 }}>
      <GooglePlacesTextInput
        apiKey={process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}
        placeHolderText="Search for a place"
        onPlaceSelect={handlePlaceSelect}
        style={customStyles}
        initialValue={initialLocation}
      />
    </View>
  );
};
