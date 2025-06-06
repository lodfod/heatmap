import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { Typography } from "../constants/Typography";
import { useColorScheme } from "../hooks/useColorScheme";

// Define the props for our EventCard component
export interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  attendees?: number;
  onRSVP?: (id: string) => void;
}

export function EventCard({
  id,
  title,
  date,
  location,
  imageUrl,
  attendees,
  onRSVP,
}: EventCardProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  // Ensure we have a valid image URL
  const validImageUrl =
    imageUrl || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30";

  // Navigate to the event details page
  const handlePress = () => {
    router.push(`/event/${id}`);
  };

  // Handle the RSVP button press
  const handleRSVP = (e: GestureResponderEvent) => {
    e.stopPropagation();
    if (onRSVP) {
      onRSVP(id);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.cardBackground }]}
      onPress={handlePress}
    >
      {/* Event Image */}
      <Image
        source={{ uri: validImageUrl }}
        style={styles.image}
        contentFit="cover"
        transition={200}
        onError={(error) => {
          console.log("❌ Image load error for event", id, ":", error);
        }}
        onLoad={() => {
          console.log("✅ Image loaded for event", id);
        }}
      />

      {/* Event Info */}
      <View style={styles.content}>
        <Text
          style={[Typography.eventTitle, { color: colors.text }]}
          numberOfLines={1}
        >
          {title}
        </Text>

        <Text style={[Typography.eventDate, { color: colors.accent1 }]}>
          {date}
        </Text>

        <Text
          style={[Typography.eventLocation, { color: colors.text }]}
          numberOfLines={1}
        >
          {location}
        </Text>

        {attendees ? (
          <Text style={[Typography.caption, { color: colors.icon }]}>
            {attendees} {attendees === 1 ? "person" : "people"} attending
          </Text>
        ) : null}
      </View>

      {/* RSVP Button */}
      {onRSVP && (
        <TouchableOpacity
          style={[styles.rsvpButton, { backgroundColor: colors.tint }]}
          onPress={handleRSVP}
        >
          <Text style={[Typography.buttonSmall, { color: "#FFF" }]}>RSVP</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  image: {
    width: "100%",
    height: 180,
  },
  content: {
    padding: 16,
  },
  rsvpButton: {
    position: "absolute",
    bottom: 16,
    right: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 2,
  },
});
