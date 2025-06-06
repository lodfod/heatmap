import React, { useEffect, useRef } from "react";
import { LogBox, View } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
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

  useEffect(() => {
    // Suppress VirtualizedList warning for GooglePlacesAutocomplete
    LogBox.ignoreLogs([
      "VirtualizedLists should never be nested inside plain ScrollViews",
      "VirtualizedList: missing keys for items",
    ]);
  }, []);

  return (
    <View style={{ width: "100%", zIndex: 1 }}>
      <GooglePlacesAutocomplete
        ref={googlePlacesRef}
        placeholder="Search for a location"
        minLength={2}
        fetchDetails={true}
        enablePoweredByContainer={false}
        suppressDefaultStyles={false}
        keepResultsAfterBlur={true}
        listViewDisplayed="auto"
        disableScroll={true}
        keyboardShouldPersistTaps="handled"
        query={{
          key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
          language: "en",
          types: "establishment|geocode",
          components: "country:us", // You can modify this or remove to allow worldwide
        }}
        textInputProps={{
          defaultValue: initialLocation,
          autoCapitalize: "none",
          autoCorrect: false,
          placeholderTextColor: colors.icon,
          returnKeyType: "search",
        }}
        onPress={(data, details = null) => {
          console.log("Selected place data:", data);
          console.log("Selected place details:", details);

          if (details && details.geometry && details.geometry.location) {
            // Use the main text from structured formatting if available, otherwise use description
            const placeName =
              data.structured_formatting?.main_text ||
              data.description ||
              details.name ||
              "Unknown Location";

            const locationData: LocationData = {
              name: placeName,
              category: "Google Place",
              coordinates: {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
              },
            };

            console.log("Processed location data:", locationData);
            onSelectLocation(locationData);

            // Update the text input to show the selected place name
            if (googlePlacesRef.current) {
              googlePlacesRef.current.setAddressText(placeName);
            }
          }
        }}
        onFail={(error) => {
          console.log("GooglePlacesAutocomplete error:", error);
        }}
        requestUrl={{
          useOnPlatform: "web",
          url: "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api",
          headers: {
            "Content-Type": "application/json",
          },
        }}
        styles={{
          container: {
            width: "100%",
            zIndex: 1000,
            position: "relative",
          },
          textInput: {
            height: 50,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 16,
            fontSize: 16,
            backgroundColor: colors.cardBackground,
            color: colors.text,
          },
          listView: {
            backgroundColor: colors.cardBackground,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            elevation: 5,
            shadowColor: colors.text,
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            zIndex: 1001,
            position: "absolute",
            top: 51,
            width: "100%",
            maxHeight: 200,
          },
          row: {
            padding: 13,
            minHeight: 44,
            flexDirection: "row",
            backgroundColor: colors.cardBackground,
          },
          separator: {
            height: 0.5,
            backgroundColor: colors.border,
          },
          description: {
            fontSize: 15,
            color: colors.text,
          },
          predefinedPlacesDescription: {
            color: colors.tint,
          },
        }}
        debounce={300}
        nearbyPlacesAPI="GooglePlacesSearch"
        GooglePlacesSearchQuery={{
          rankby: "distance",
        }}
        filterReverseGeocodingByTypes={[
          "locality",
          "administrative_area_level_3",
        ]}
        predefinedPlaces={[]}
      />
    </View>
  );
};
