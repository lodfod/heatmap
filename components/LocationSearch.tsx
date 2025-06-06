import React, { useRef, useState } from "react";
import { View } from "react-native";
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
  const [selectionMade, setSelectionMade] = useState(false);

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
        listViewDisplayed={selectionMade ? false : "auto"}
        disableScroll={true}
        keyboardShouldPersistTaps="handled"
        query={{
          key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
          language: "en",
          types: "establishment|geocode",
          components: "country:us",
        }}
        textInputProps={{
          defaultValue: initialLocation,
          autoCapitalize: "none",
          autoCorrect: false,
          placeholderTextColor: colors.icon,
          returnKeyType: "search",
        }}
        onPress={(data, details = null) => {
          if (details && details.geometry?.location) {
            const fullAddress =
  details.formatted_address ||
  data.description ||
  data.structured_formatting?.main_text ||
  details.name ||
  "Unknown Location";


            const locationData: LocationData = {
              name: fullAddress,
              category: "Google Place",
              coordinates: {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
              },
            };

            onSelectLocation(locationData);

            if (googlePlacesRef.current) {
              googlePlacesRef.current.setAddressText(fullAddress);

              // Blur keyboard
              googlePlacesRef.current?.textInput?.blur?.();

              // Hide dropdown
              setSelectionMade(true);
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
            shadowOffset: { width: 0, height: 2 },
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
        GooglePlacesSearchQuery={{ rankby: "distance" }}
        filterReverseGeocodingByTypes={[
          "locality",
          "administrative_area_level_3",
        ]}
        predefinedPlaces={[]}
      />
    </View>
  );
};
