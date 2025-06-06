import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
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

  // Helper function to upload image to Supabase Storage
  const uploadImageToStorage = async (imageUri: string): Promise<string> => {
    const response = await fetch(imageUri);
    const blob = await response.blob();

    // Create a unique filename
    const fileExt = imageUri.split(".").pop() || "jpg";
    const fileName = `event-cover-${Date.now()}.${fileExt}`;
    const filePath = `event-covers/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("event-images")
      .upload(filePath, blob, {
        contentType: `image/${fileExt}`,
        upsert: false,
      });

    if (error) {
      console.error("Error uploading image:", error);
      throw error;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from("event-images")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  // Handle form submission
  const handleSubmit = async (data: EventFormData) => {
    // Prevent double submission
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      let imageUrl =
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"; // Default image

      // Upload cover image if one was selected
      if (coverImage) {
        imageUrl = await uploadImageToStorage(coverImage);
      }

      // Prepare event data for creation - fixing the type mapping
      const newEventData: NewEventData = {
        title: data.title,
        date: data.date,
        time: data.time,
        location: data.location,
        description: data.description,
        created_by: "0",
        genre: data.genre || "",
        coordinates: data.coordinates,
        latitude: data.coordinates.latitude,
        longitude: data.coordinates.longitude,
        imageUrl: imageUrl,
      };

      // Add the event to our central data store
      const newEventId = addNewEvent(newEventData);

      //adding the event to the table
      const { data: insertData, error } = await supabase
        .from("events")
        .insert([
          {
            title: newEventData.title,
            date: newEventData.date + newEventData.time,
            location: newEventData.location,
            description: newEventData.description,
            created_by: newEventData.created_by,
            genre: newEventData.genre,
            latitude: newEventData.latitude,
            longitude: newEventData.longitude,
            imageUrl: newEventData.imageUrl,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Show success message
      Alert.alert(
        "Event Created",
        "Your event has been created successfully!",
        [
          {
            text: "View Event",
            onPress: () => router.push(`/event/${insertData.id}`),
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

      <View style={{ flex: 1 }}>
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
      </View>
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
