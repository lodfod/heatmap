import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SwipeCard } from "../../components/SwipeCard";
import { Colors } from "../../constants/Colors";
import { Typography } from "../../constants/Typography";
import { EventDetails, getAllEvents } from "../../data/events";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function DiscoverScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  // State for event data
  const [events, setEvents] = useState<EventDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // State for liked and rejected events
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const [rejectedEvents, setRejectedEvents] = useState<string[]>([]);

  // Load events on component mount
  useEffect(() => {
    // Get events from the data store
    const fetchedEvents = getAllEvents();

    // For Discover, we want to show events with more details
    // so we map them to the required format
    const formattedEvents = fetchedEvents.map((event) => ({
      id: event.id,
      title: event.title,
      date: event.date,
      location: event.location,
      description: "", // This field is missing in getAllEvents return type
      imageUrl: event.imageUrl,
      distance: "1.2 miles", // This is hardcoded for now, could be calculated based on user location
    }));

    setEvents(formattedEvents);
    setLoading(false);
  }, []);

  // Handle swipe right (like)
  const handleSwipeRight = (item: any) => {
    console.log("Liked event:", item.id);
    setLikedEvents([...likedEvents, item.id]);
  };

  // Handle swipe left (reject)
  const handleSwipeLeft = (item: any) => {
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

  // Show loading indicator while fetching events
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text style={[Typography.bodyLarge, { color: colors.text }]}>
          Loading events...
        </Text>
      </View>
    );
  }

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
          data={events}
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
