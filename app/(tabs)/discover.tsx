import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LikedEventsView } from "../../components/LikedEventsView";
import { EventData, SwipeCard } from "../../components/SwipeCard";
import { Colors } from "../../constants/Colors";
import { Typography } from "../../constants/Typography";
import { getAllEvents } from "../../data/events";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function DiscoverScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  // State for event data
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  // State for liked and rejected events
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  const [rejectedEvents, setRejectedEvents] = useState<string[]>([]);

  // State for view management
  const [showLikedEvents, setShowLikedEvents] = useState(false);

  // Load events on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        // Get events from the data store
        const fetchedEvents = await getAllEvents();

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
      } catch (error) {
        console.error("Error loading events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Debug useEffect to track state changes in liked and rejected events
  useEffect(() => {
    console.log("🟢 Liked events array updated:", likedEvents);
  }, [likedEvents]);

  useEffect(() => {
    console.log("🔴 Rejected events array updated:", rejectedEvents);
  }, [rejectedEvents]);

  // Reset state when events data changes
  useEffect(() => {
    if (events.length > 0) {
      setLikedEvents([]);
      setRejectedEvents([]);
    }
  }, [events]);

  // Handle swipe right (like)
  const handleSwipeRight = (item: EventData) => {
    console.log("✅ Liked event:", item.id, item.title);
    // Make sure we don't add duplicates
    if (!likedEvents.includes(item.id)) {
      setLikedEvents((prev) => [...prev, item.id]);
    }
  };

  // Handle swipe left (reject)
  const handleSwipeLeft = (item: EventData) => {
    console.log("❌ Rejected event:", item.id, item.title);
    // Make sure we don't add duplicates
    if (!rejectedEvents.includes(item.id)) {
      setRejectedEvents((prev) => [...prev, item.id]);
    }
  };

  // Handle view liked events button press
  const handleViewLikedEvents = () => {
    setShowLikedEvents(true);
  };

  // Handle back from liked events view
  const handleBackFromLikedEvents = () => {
    setShowLikedEvents(false);
  };

  // Handle event press in liked events view
  const handleEventPress = (event: EventData) => {
    console.log("Pressed event:", event.title);
    // You can add navigation to event details here
  };

  // Get liked events data
  const getLikedEventsData = (): EventData[] => {
    return events.filter((event) => likedEvents.includes(event.id));
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
            onPress={handleViewLikedEvents}
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

  // Show liked events view
  if (showLikedEvents) {
    return (
      <LikedEventsView
        likedEvents={getLikedEventsData()}
        colors={colors}
        onBack={handleBackFromLikedEvents}
        onEventPress={handleEventPress}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      <View style={styles.header}>
        <View style={styles.headerContent}>
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

        {likedEvents.length > 0 && (
          <TouchableOpacity
            style={[styles.likedEventsButton, { backgroundColor: colors.tint }]}
            onPress={handleViewLikedEvents}
          >
            <Ionicons name="heart" size={20} color="#FFF" />
            <Text
              style={[Typography.caption, { color: "#FFF", marginLeft: 4 }]}
            >
              {likedEvents.length}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.swipeContainer}>
        <SwipeCard
          data={events}
          onSwipeRight={handleSwipeRight}
          onSwipeLeft={handleSwipeLeft}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerContent: {
    flex: 1,
  },
  likedEventsButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
