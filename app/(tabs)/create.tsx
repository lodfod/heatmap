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

  // Fixed upload function using FormData for React Native compatibility
  const uploadImageToStorage = async (imageUri: string): Promise<string> => {
    console.log("📸 Starting FormData upload process...");
    console.log("📸 Image URI:", imageUri);

    try {
      // Validate image URI
      if (!imageUri || imageUri.trim() === "") {
        throw new Error("Invalid image URI provided");
      }

      // Generate file info
      const timestamp = Date.now();
      const fileExt = imageUri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `event-cover-${timestamp}.${fileExt}`;
      const filePath = `event-covers/${fileName}`;

      console.log("📸 Will upload to path:", filePath);

      // Create FormData with the file
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: `image/${fileExt}`,
        name: fileName,
      } as any);

      console.log("📸 FormData created, getting signed upload URL...");

      // Get a signed upload URL from Supabase
      const { data: uploadData, error: signedUrlError } = await supabase.storage
        .from("event-images")
        .createSignedUploadUrl(filePath);

      if (signedUrlError) {
        console.error("❌ Failed to get signed URL:", signedUrlError);
        throw signedUrlError;
      }

      console.log("📸 Got signed URL, uploading with fetch...");

      // Upload using fetch with FormData
      const uploadResponse = await fetch(uploadData.signedUrl, {
        method: "PUT",
        body: formData,
      });

      console.log("📸 Upload response status:", uploadResponse.status);
      console.log("📸 Upload response ok:", uploadResponse.ok);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("❌ Upload failed with response:", errorText);
        throw new Error(
          `Upload failed: ${uploadResponse.status} - ${errorText}`
        );
      }

      console.log("✅ FormData upload successful!");

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("event-images")
        .getPublicUrl(filePath);

      console.log("📸 Generated public URL:", urlData.publicUrl);

      if (!urlData.publicUrl) {
        throw new Error("Failed to generate public URL");
      }

      return urlData.publicUrl;
    } catch (error) {
      console.error("❌ FormData upload failed:", error);
      throw error;
    }
  };

  // Helper function to create ISO timestamp from date and time strings
  const createEventTimestamp = (dateStr: string, timeStr: string): string => {
    // Parse the date (MM/DD/YYYY format)
    const [month, day, year] = dateStr.split("/").map((num) => parseInt(num));

    // Parse the time (HH:MM AM/PM format)
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!timeMatch) {
      throw new Error("Invalid time format");
    }

    let hours = parseInt(timeMatch[1]);
    const minutes = parseInt(timeMatch[2]);
    const period = timeMatch[3].toUpperCase();

    // Convert to 24-hour format
    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }

    // Create date object and convert to ISO string
    const eventDate = new Date(year, month - 1, day, hours, minutes);
    return eventDate.toISOString();
  };

  // Handle form submission
  const handleSubmit = async (data: EventFormData) => {
    console.log("🚀 Form submitted with data:", data);
    console.log("📍 Location coordinates:", data.coordinates);
    console.log("📸 Cover image URI:", coverImage);

    // Prevent double submission
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("User not authenticated");
      }

      let imageUrl =
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"; // Default image

      // Upload cover image if one was selected
      if (coverImage && coverImage.trim() !== "") {
        console.log("📸 Uploading cover image...");
        try {
          const uploadedUrl = await uploadImageToStorage(coverImage);
          console.log("✅ Cover image uploaded successfully:", uploadedUrl);

          // Validate the returned URL
          if (
            !uploadedUrl ||
            uploadedUrl === "undefined" ||
            uploadedUrl.trim() === ""
          ) {
            throw new Error("Upload function returned invalid URL");
          }

          imageUrl = uploadedUrl;
          console.log("📸 Using uploaded image URL:", imageUrl);
        } catch (uploadError) {
          console.error("❌ Failed to upload cover image:", uploadError);
          // Show user-friendly error but continue with default image
          Alert.alert(
            "Image Upload Failed",
            `We couldn't upload your cover image: ${uploadError.message}. We'll create the event with a default image.`,
            [{ text: "OK" }]
          );
          // Keep using the default imageUrl
        }
      } else {
        console.log("📸 No cover image selected, using default");
      }

      // Create proper timestamp from date and time
      const eventTimestamp = createEventTimestamp(data.date, data.time);

      // Prepare event data for creation
      const newEventData: NewEventData = {
        title: data.title,
        date: data.date,
        time: data.time,
        location: data.location,
        description: data.description,
        created_by: userData.user.id,
        genre: data.genre || "",
        coordinates: data.coordinates,
        latitude: data.coordinates.latitude,
        longitude: data.coordinates.longitude,
        imageUrl: imageUrl,
        event_visibility: data.isPublic ? "public" : "private",
      };

      console.log(
        "💾 Saving event data with image URL:",
        newEventData.imageUrl
      );

      // Add the event to our central data store
      const newEventId = addNewEvent(newEventData);

      // Insert into Supabase with correct types
      const { data: insertData, error } = await supabase
        .from("events")
        .insert([
          {
            title: newEventData.title,
            date: eventTimestamp,
            location: newEventData.location,
            description: newEventData.description,
            created_by: newEventData.created_by,
            genre: newEventData.genre,
            event_visibility: newEventData.event_visibility,
            latitude: newEventData.latitude,
            longitude: newEventData.longitude,
            imageUrl: newEventData.imageUrl, // This should contain the uploaded image URL
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(
        "✅ Event created successfully with image URL:",
        insertData.imageUrl
      );

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
      console.error("❌ Error creating event:", error);

      // Show error message
      Alert.alert(
        "Error",
        "There was a problem creating your event. Please try again.",
        [{ text: "OK", onPress: () => setIsSubmitting(false) }]
      );
    }
  };

  // Enhanced image selection handler with debugging
  const handleImageSelected = (uri: string) => {
    console.log("📸 handleImageSelected called with URI:", uri);
    console.log("📸 URI type:", typeof uri);
    console.log("📸 URI length:", uri?.length || 0);

    if (uri && uri.trim() !== "") {
      console.log("📸 Setting coverImage state to:", uri);
      setCoverImage(uri);
      console.log("📸 coverImage state should now be set");
    } else {
      console.log("📸 Empty URI received, clearing coverImage");
      setCoverImage("");
    }

    // Log the state after a brief delay to see if it was set
    setTimeout(() => {
      console.log("📸 Current coverImage state:", coverImage);
    }, 100);
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
          {/* Add visual feedback */}
          {coverImage ? (
            <Text
              style={[
                Typography.caption,
                { color: colors.success, marginTop: 8 },
              ]}
            >
              ✅ Image selected: {coverImage.split("/").pop()}
            </Text>
          ) : (
            <Text
              style={[Typography.caption, { color: colors.icon, marginTop: 8 }]}
            >
              No image selected
            </Text>
          )}
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
