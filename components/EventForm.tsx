import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { Typography } from "../constants/Typography";
import { useColorScheme } from "../hooks/useColorScheme";
import { LocationData, LocationSearch } from "./LocationSearch";

/**
 * Interface for event data
 */
export interface EventFormData {
  title: string;
  description: string;
  location: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  date: string;
  time: string;
  isPublic: boolean;
  genre?: string;
}

/**
 * Component props
 */
interface EventFormProps {
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => void;
  submitButtonLabel?: string;
}

// List of music genres
const genreOptions = [
  { id: "rock", label: "Rock" },
  { id: "electronic", label: "Electronic" },
  { id: "jazz", label: "Jazz" },
  { id: "hiphop", label: "Hip-Hop" },
  { id: "world", label: "World Music" },
];

export function EventForm({
  initialData = {},
  onSubmit,
  submitButtonLabel = "Create Event",
}: EventFormProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  // Form state
  const [formData, setFormData] = useState<EventFormData>({
    title: initialData.title || "",
    description: initialData.description || "",
    location: initialData.location || "",
    coordinates: initialData.coordinates || {
      latitude: 37.427619,
      longitude: -122.170732, // Default to Stanford
    },
    date: initialData.date || "",
    time: initialData.time || "",
    isPublic: initialData.isPublic !== undefined ? initialData.isPublic : true,
    genre: initialData.genre || "rock",
  });

  // Field validation state
  const [errors, setErrors] = useState<
    Partial<Record<keyof EventFormData, string>>
  >({});

  // Handle text input changes
  const handleChange = (
    field: keyof EventFormData,
    value: string | boolean | object
  ) => {
    console.log(`📝 Form field changed: ${field}`, value);
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [field]: undefined,
      }));
    }
  };

  // Handle location selection - updated to use single state update
  const handleLocationSelect = (location: LocationData) => {
    console.log("📍 Location selected in EventForm:", location);
    console.log("📍 Location name:", location.name);
    console.log("📍 Location coordinates:", location.coordinates);

    // Update both location and coordinates in a single state update
    setFormData((prevData) => ({
      ...prevData,
      location: location.name,
      coordinates: location.coordinates,
    }));

    // Clear location error if it exists
    if (errors.location) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        location: undefined,
      }));
    }

    // Log the updated form data after state update
    setTimeout(() => {
      console.log("📋 Form data after location update should be updated now");
    }, 100);
  };

  // Toggle public/private setting
  const toggleIsPublic = () => {
    handleChange("isPublic", !formData.isPublic);
  };

  // Handle genre selection
  const handleGenreSelect = (genreId: string) => {
    handleChange("genre", genreId);
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    console.log("🔍 Validating form with data:", formData);
    console.log("🔍 Location validation - value:", `"${formData.location}"`);
    console.log(
      "🔍 Location validation - trimmed:",
      `"${formData.location.trim()}"`
    );
    console.log(
      "🔍 Location validation - length:",
      formData.location.trim().length
    );
    console.log("🔍 Coordinates validation:", formData.coordinates);
    console.log("🔍 Coordinates latitude:", formData.coordinates.latitude);
    console.log("🔍 Coordinates longitude:", formData.coordinates.longitude);
    console.log(
      "🔍 Are coordinates default values?",
      formData.coordinates.latitude === 37.427619 &&
        formData.coordinates.longitude === -122.170732
    );

    const newErrors: Partial<Record<keyof EventFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
      console.log("❌ Location validation failed - location is empty");
    } else {
      console.log("✅ Location validation passed");
    }

    if (!formData.date.trim()) {
      newErrors.date = "Date is required";
    }

    if (!formData.time.trim()) {
      newErrors.time = "Time is required";
    }

    console.log("🔍 Validation errors:", newErrors);
    console.log("🔍 Form is valid:", Object.keys(newErrors).length === 0);

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderFormField = ({ item }: { item: any }) => {
    switch (item.type) {
      case "title":
        return (
          <View style={styles.fieldContainer}>
            <Text
              style={[
                Typography.bodySmall,
                styles.label,
                { color: colors.text },
              ]}
            >
              Event Title *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.cardBackground,
                  color: colors.text,
                  borderColor: errors.title ? colors.error : colors.border,
                },
              ]}
              value={formData.title}
              onChangeText={(value) => handleChange("title", value)}
              placeholder="Enter event title"
              placeholderTextColor={colors.icon}
            />
            {errors.title ? (
              <Text style={[Typography.caption, { color: colors.error }]}>
                {errors.title}
              </Text>
            ) : null}
          </View>
        );
      case "description":
        return (
          <View style={styles.fieldContainer}>
            <Text
              style={[
                Typography.bodySmall,
                styles.label,
                { color: colors.text },
              ]}
            >
              Description
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: colors.cardBackground,
                  color: colors.text,
                  borderColor: errors.description
                    ? colors.error
                    : colors.border,
                },
              ]}
              value={formData.description}
              onChangeText={(value) => handleChange("description", value)}
              placeholder="Describe your event"
              placeholderTextColor={colors.icon}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        );
      case "location":
        return (
          <View style={styles.fieldContainer}>
            <Text
              style={[
                Typography.bodySmall,
                styles.label,
                { color: colors.text },
              ]}
            >
              Location *
            </Text>
            <LocationSearch
              onSelectLocation={handleLocationSelect}
              initialLocation={formData.location}
            />
            {errors.location ? (
              <Text style={[Typography.caption, { color: colors.error }]}>
                {errors.location}
              </Text>
            ) : null}
          </View>
        );
      case "datetime":
        return (
          <View style={styles.rowContainer}>
            <View style={[styles.fieldContainer, { flex: 1, marginRight: 8 }]}>
              <Text
                style={[
                  Typography.bodySmall,
                  styles.label,
                  { color: colors.text },
                ]}
              >
                Date *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.cardBackground,
                    color: colors.text,
                    borderColor: errors.date ? colors.error : colors.border,
                  },
                ]}
                value={formData.date}
                onChangeText={(value) => handleChange("date", value)}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={colors.icon}
              />
              {errors.date ? (
                <Text style={[Typography.caption, { color: colors.error }]}>
                  {errors.date}
                </Text>
              ) : null}
            </View>
            <View style={[styles.fieldContainer, { flex: 1, marginLeft: 8 }]}>
              <Text
                style={[
                  Typography.bodySmall,
                  styles.label,
                  { color: colors.text },
                ]}
              >
                Time *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.cardBackground,
                    color: colors.text,
                    borderColor: errors.time ? colors.error : colors.border,
                  },
                ]}
                value={formData.time}
                onChangeText={(value) => handleChange("time", value)}
                placeholder="HH:MM AM/PM"
                placeholderTextColor={colors.icon}
              />
              {errors.time ? (
                <Text style={[Typography.caption, { color: colors.error }]}>
                  {errors.time}
                </Text>
              ) : null}
            </View>
          </View>
        );
      case "genre":
        return (
          <View style={styles.fieldContainer}>
            <Text
              style={[
                Typography.bodySmall,
                styles.label,
                { color: colors.text },
              ]}
            >
              Genre
            </Text>
            <View style={styles.genreContainer}>
              {genreOptions.map((genre) => (
                <TouchableOpacity
                  key={genre.id}
                  style={[
                    styles.genreOption,
                    {
                      backgroundColor:
                        formData.genre === genre.id
                          ? colors.tint
                          : colors.cardBackground,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => handleGenreSelect(genre.id)}
                >
                  <Text
                    style={[
                      Typography.bodySmall,
                      {
                        color:
                          formData.genre === genre.id ? "#FFF" : colors.text,
                      },
                    ]}
                  >
                    {genre.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      case "visibility":
        return (
          <View style={styles.fieldContainer}>
            <Text
              style={[
                Typography.bodySmall,
                styles.label,
                { color: colors.text },
              ]}
            >
              Event Visibility
            </Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  {
                    backgroundColor: formData.isPublic
                      ? colors.tint
                      : colors.cardBackground,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleChange("isPublic", true)}
              >
                <Text
                  style={[
                    Typography.bodySmall,
                    { color: formData.isPublic ? "#FFF" : colors.text },
                  ]}
                >
                  Public
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleOption,
                  {
                    backgroundColor: !formData.isPublic
                      ? colors.tint
                      : colors.cardBackground,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => handleChange("isPublic", false)}
              >
                <Text
                  style={[
                    Typography.bodySmall,
                    { color: !formData.isPublic ? "#FFF" : colors.text },
                  ]}
                >
                  Private
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case "submit":
        return (
          <>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.tint }]}
              onPress={handleSubmit}
            >
              <Text style={[Typography.buttonMedium, { color: "#FFF" }]}>
                {submitButtonLabel}
              </Text>
            </TouchableOpacity>
            <View style={{ height: 100 }} />
          </>
        );
      default:
        return null;
    }
  };

  const formFields = [
    { type: "title", key: "title" },
    { type: "description", key: "description" },
    { type: "location", key: "location" },
    { type: "datetime", key: "datetime" },
    { type: "genre", key: "genre" },
    { type: "visibility", key: "visibility" },
    { type: "submit", key: "submit" },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <FlatList
        data={formFields}
        renderItem={renderFormField}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.formContainer}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: "600",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
  },
  rowContainer: {
    flexDirection: "row",
  },
  toggleContainer: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 32,
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  genreOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
});
