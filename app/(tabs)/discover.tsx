import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EventData, SwipeCard } from "../../components/SwipeCard";
import { Colors } from "../../constants/Colors";
import { Typography } from "../../constants/Typography";
import { useColorScheme } from "../../hooks/useColorScheme";

// Mock data for swipeable events
const mockEvents: EventData[] = [
  {
    id: "101",
    title: "Silicon Valley Innovation Summit",
    date: "Saturday, Jun 8, 2023 • 10:00 AM",
    location: "Huang Engineering Center",
    description:
      "Join top entrepreneurs and VCs for a day of insights and networking.",
    imageUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94",
    distance: "0.8 miles",
  },
  {
    id: "102",
    title: "Music in the Quad",
    date: "Friday, Jun 7, 2023 • 6:00 PM",
    location: "Main Quad",
    description:
      "Enjoy live music from student bands and local artists in the beautiful Main Quad.",
    imageUrl: "https://images.unsplash.com/photo-1501612780327-45045538702b",
    distance: "0.5 miles",
  },
  {
    id: "103",
    title: "Basketball Tournament Finals",
    date: "Sunday, Jun 9, 2023 • 3:00 PM",
    location: "Maples Pavilion",
    description: "Watch the finals of the intramural basketball tournament.",
    imageUrl: "https://images.unsplash.com/photo-1518407613690-d9fc990e795f",
    distance: "1.2 miles",
  },
  {
    id: "104",
    title: "AI Ethics Panel Discussion",
    date: "Tuesday, Jun 11, 2023 • 4:00 PM",
    location: "Gates Building, Room 104",
    description:
      "Distinguished faculty discuss ethical considerations in artificial intelligence.",
    imageUrl: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f",
    distance: "0.7 miles",
  },
  {
    id: "105",
    title: "Sustainable Food Festival",
    date: "Thursday, Jun 13, 2023 • 11:00 AM",
    location: "Meyer Green",
    description:
      "Taste sustainable and locally sourced food while learning about eco-friendly practices.",
    imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033",
    distance: "0.3 miles",
  },
];

export default function DiscoverScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  // State for liked and rejected events
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const [rejectedEvents, setRejectedEvents] = useState<string[]>([]);

  // Handle swipe right (like)
  const handleSwipeRight = (item: EventData) => {
    console.log("Liked event:", item.id);
    setLikedEvents([...likedEvents, item.id]);
  };

  // Handle swipe left (reject)
  const handleSwipeLeft = (item: EventData) => {
    console.log("Rejected event:", item.id);
    setRejectedEvents([...rejectedEvents, item.id]);
  };

  // Render when no more cards
  const renderNoMoreCards = () => {
    return (
      <View style={styles.noMoreCardsContainer}>
        <Ionicons name="calendar-outline" size={80} color={colors.icon} />
        <Text
          style={[
            Typography.headingMedium,
            { color: colors.text, marginTop: 20 },
          ]}
        >
          No More Events
        </Text>
        <Text
          style={[
            Typography.bodyMedium,
            {
              color: colors.text,
              opacity: 0.7,
              marginTop: 10,
              textAlign: "center",
            },
          ]}
        >
          You&apos;ve seen all events in your area. Check back later for new
          ones!
        </Text>
        {likedEvents.length > 0 && (
          <TouchableOpacity
            style={[styles.viewLikedButton, { backgroundColor: colors.tint }]}
            onPress={() => console.log("View liked events")}
          >
            <Text style={[Typography.buttonMedium, { color: "#FFF" }]}>
              View Liked Events ({likedEvents.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      <View style={styles.header}>
        <Text style={[Typography.headingLarge, { color: colors.text }]}>
          Discover
        </Text>
        <Text
          style={[
            Typography.bodyMedium,
            { color: colors.text, opacity: 0.7, marginTop: 8 },
          ]}
        >
          Swipe to find events near you
        </Text>
      </View>

      <View style={styles.swipeContainer}>
        <SwipeCard
          data={mockEvents}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          renderNoMoreCards={renderNoMoreCards}
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
  swipeContainer: {
    flex: 1,
    paddingBottom: 50, // Space for tab bar
  },
  noMoreCardsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  viewLikedButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
});
