import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { EventForm, EventFormData } from "../../components/EventForm";
import { ImagePickerComponent } from "../../components/ImagePickerComponent";
import { Colors } from "../../constants/Colors";
import { Typography } from "../../constants/Typography";
import { addNewEvent, NewEventData } from "../../data/events";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function CreateEventScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();

  // State for the event cover image
  const [coverImage, setCoverImage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form submission
  const handleSubmit = async (data: EventFormData) => {
    // Prevent double submission
    if (isSubmitting) return;

    setIsSubmitting(true);

    // Prepare event data for creation
    const newEventData: NewEventData = {
      title: data.title,
      date: data.date + data.time,
      location: data.location,
      description: data.description,
      created_by: "0",
      genre: data.genre || "",
      latitude: data.coordinates.latitude,
      longitude: data.coordinates.longitude,
      img_path:
        coverImage ||
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30", // Default image if none selected
      
    };

    try {
      // Add the event to our central data store
      const newEventId = addNewEvent(newEventData);

      //adding the event to the table
      const { data, error } = await supabase
        .from('Events')
        .insert([
          newEventData,
        ]);

      // Show success message
      Alert.alert(
        "Event Created",
        "Your event has been created successfully!",
        [
          {
            text: "View Event",
            onPress: () => router.push(`/event/${newEventId}`),
          },
          {
            text: "Create Another",
            onPress: () => {
              // Reset the form
              setCoverImage("");
              setIsSubmitting(false);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error creating event:", error);

      // Show error message
      Alert.alert(
        "Error",
        "There was a problem creating your event. Please try again.",
        [{ text: "OK", onPress: () => setIsSubmitting(false) }]
      );
    }
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
            Create and share your music event with friends
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
        <EventForm
          onSubmit={handleSubmit}
          submitButtonLabel={isSubmitting ? "Creating..." : "Create Event"}
        />
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
