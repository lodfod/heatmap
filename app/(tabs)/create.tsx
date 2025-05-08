import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { EventForm, EventFormData } from "../../components/EventForm";
import { ImagePickerComponent } from "../../components/ImagePickerComponent";
import { Colors } from "../../constants/Colors";
import { Typography } from "../../constants/Typography";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function CreateEventScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();

  // State for the event cover image
  const [coverImage, setCoverImage] = useState<string>("");

  // Handle form submission
  const handleSubmit = (data: EventFormData) => {
    // In a real app, this would make an API call to save the event
    console.log("Creating event:", { ...data, coverImage });

    // Generate a mock event ID
    const eventId = Math.floor(Math.random() * 10000).toString();

    // Show success message
    Alert.alert("Event Created", "Your event has been created successfully!", [
      {
        text: "View Event",
        onPress: () => router.push(`/event/${eventId}`),
      },
      {
        text: "Create Another",
        onPress: () => {
          // Reset the form (in a real app this would clear the form)
          setCoverImage("");
        },
      },
    ]);
  };

  // Handle image selection
  const handleImageSelected = (uri: string) => {
    setCoverImage(uri);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[Typography.headingLarge, { color: colors.text }]}>
            Create Event
          </Text>
          <Text
            style={[
              Typography.bodyMedium,
              { color: colors.text, opacity: 0.7, marginTop: 8 },
            ]}
          >
            Create and share your event with friends
          </Text>
        </View>

        {/* Cover Image Picker */}
        <View style={styles.imagePickerContainer}>
          <ImagePickerComponent
            onImageSelected={handleImageSelected}
            label="Event Cover Image"
          />
        </View>

        {/* Event Form */}
        <EventForm onSubmit={handleSubmit} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  imagePickerContainer: {
    paddingHorizontal: 16,
  },
});
