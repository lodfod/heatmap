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

  const handlePlaceSelect = (place) => {
    console.log("Selected place:", place);
    if (place && place.geometry && place.geometry.location) {
      const locationData: LocationData = {
        name: place.description || place.name || "",
        coordinates: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        },
        category: place.types?.[0] || "place",
      };
      onSelectLocation(locationData);
      setSelectionMade(true);
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
