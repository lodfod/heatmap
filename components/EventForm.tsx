import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
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

/**
 * Interface for event data
 */
export interface EventFormData {
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  isPublic: boolean;
}

/**
 * Component props
 */
interface EventFormProps {
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => void;
  submitButtonLabel?: string;
}

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
    date: initialData.date || "",
    time: initialData.time || "",
    isPublic: initialData.isPublic !== undefined ? initialData.isPublic : true,
  });

  // Field validation state
  const [errors, setErrors] = useState<
    Partial<Record<keyof EventFormData, string>>
  >({});

  // Handle text input changes
  const handleChange = (
    field: keyof EventFormData,
    value: string | boolean
  ) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Clear error when field is edited
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: undefined,
      });
    }
  };

  // Toggle public/private setting
  const toggleIsPublic = () => {
    handleChange("isPublic", !formData.isPublic);
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (!formData.date.trim()) {
      newErrors.date = "Date is required";
    }

    if (!formData.time.trim()) {
      newErrors.time = "Time is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <View style={styles.fieldContainer}>
          <Text
            style={[Typography.bodySmall, styles.label, { color: colors.text }]}
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

        {/* Description Input */}
        <View style={styles.fieldContainer}>
          <Text
            style={[Typography.bodySmall, styles.label, { color: colors.text }]}
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
                borderColor: errors.description ? colors.error : colors.border,
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

        {/* Location Input */}
        <View style={styles.fieldContainer}>
          <Text
            style={[Typography.bodySmall, styles.label, { color: colors.text }]}
          >
            Location *
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.cardBackground,
                color: colors.text,
                borderColor: errors.location ? colors.error : colors.border,
              },
            ]}
            value={formData.location}
            onChangeText={(value) => handleChange("location", value)}
            placeholder="Enter event location"
            placeholderTextColor={colors.icon}
          />
          {errors.location ? (
            <Text style={[Typography.caption, { color: colors.error }]}>
              {errors.location}
            </Text>
          ) : null}
        </View>

        {/* Date & Time Inputs */}
        <View style={styles.rowContainer}>
          {/* Date Input */}
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

          {/* Time Input */}
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
              placeholder="7:00 PM"
              placeholderTextColor={colors.icon}
            />
            {errors.time ? (
              <Text style={[Typography.caption, { color: colors.error }]}>
                {errors.time}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Public/Private Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleOption,
              {
                backgroundColor: formData.isPublic
                  ? colors.accent1
                  : colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={() => formData.isPublic || toggleIsPublic()}
          >
            <Text
              style={[
                Typography.bodyMedium,
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
                  ? colors.accent1
                  : colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={() => !formData.isPublic || toggleIsPublic()}
          >
            <Text
              style={[
                Typography.bodyMedium,
                { color: !formData.isPublic ? "#FFF" : colors.text },
              ]}
            >
              Private
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.tint }]}
          onPress={handleSubmit}
        >
          <Text style={[Typography.buttonMedium, { color: "#FFF" }]}>
            {submitButtonLabel}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  rowContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  toggleContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
});
