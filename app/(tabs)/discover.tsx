import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LikedEventsView } from "../../components/LikedEventsView";
import { EventData, SwipeCard } from "../../components/SwipeCard";
import { Colors } from "../../constants/Colors";
import { Typography } from "../../constants/Typography";
import { getAllEvents } from "../../data/events";
import { useColorScheme } from "../../hooks/useColorScheme";

// AsyncStorage keys
const LIKED_EVENTS_KEY = "@liked_events";
const REJECTED_EVENTS_KEY = "@rejected_events";

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

  // Load persisted swipe data from AsyncStorage
  const loadSwipeData = async () => {
    try {
      console.log("📱 Loading swipe data from AsyncStorage...");

      const [likedData, rejectedData] = await Promise.all([
        AsyncStorage.getItem(LIKED_EVENTS_KEY),
        AsyncStorage.getItem(REJECTED_EVENTS_KEY),
      ]);

      const liked = likedData ? JSON.parse(likedData) : [];
      const rejected = rejectedData ? JSON.parse(rejectedData) : [];

      console.log("✅ Loaded liked events:", liked.length);
      console.log("✅ Loaded rejected events:", rejected.length);

      setLikedEvents(liked);
      setRejectedEvents(rejected);
    } catch (error) {
      console.error("❌ Error loading swipe data:", error);
      // If there's an error, just use empty arrays
      setLikedEvents([]);
      setRejectedEvents([]);
    }
  };

  // Save liked events to AsyncStorage
  const saveLikedEvents = async (likedEventIds: string[]) => {
    try {
      await AsyncStorage.setItem(
        LIKED_EVENTS_KEY,
        JSON.stringify(likedEventIds)
      );
      console.log(
        "💾 Saved liked events to AsyncStorage:",
        likedEventIds.length
      );
    } catch (error) {
      console.error("❌ Error saving liked events:", error);
    }
  };

  // Save rejected events to AsyncStorage
  const saveRejectedEvents = async (rejectedEventIds: string[]) => {
    try {
      await AsyncStorage.setItem(
        REJECTED_EVENTS_KEY,
        JSON.stringify(rejectedEventIds)
      );
      console.log(
        "💾 Saved rejected events to AsyncStorage:",
        rejectedEventIds.length
      );
    } catch (error) {
      console.error("❌ Error saving rejected events:", error);
    }
  };

  // Clear all swipe data (useful for testing or reset functionality)
  const clearSwipeData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(LIKED_EVENTS_KEY),
        AsyncStorage.removeItem(REJECTED_EVENTS_KEY),
      ]);
      setLikedEvents([]);
      setRejectedEvents([]);
      console.log("🗑️ Cleared all swipe data");
    } catch (error) {
      console.error("❌ Error clearing swipe data:", error);
    }
  };

  // Load events and swipe data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load swipe data first
        await loadSwipeData();

        // Then load events
        const fetchedEvents = await getAllEvents();

        const formattedEvents = fetchedEvents.map((event) => ({
          id: event.id,
          title: event.title,
          date: event.date,
          location: event.location,
          description: event.description || "",
          imageUrl: event.imageUrl,
          distance: "1.2 miles",
        }));

        setEvents(formattedEvents);
        console.log("📊 Loaded events:", formattedEvents.length);
      } catch (error) {
        console.error("Error loading data:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save liked events whenever they change
  useEffect(() => {
    if (likedEvents.length > 0) {
      saveLikedEvents(likedEvents);
    }
    console.log("🟢 Liked events array updated:", likedEvents);
  }, [likedEvents]);

  // Save rejected events whenever they change
  useEffect(() => {
    if (rejectedEvents.length > 0) {
      saveRejectedEvents(rejectedEvents);
    }
    console.log("🔴 Rejected events array updated:", rejectedEvents);
  }, [rejectedEvents]);

  // Filter out events that have already been swiped on
  const getAvailableEvents = (): EventData[] => {
    const swipedEventIds = [...likedEvents, ...rejectedEvents];
    const availableEvents = events.filter(
      (event) => !swipedEventIds.includes(event.id)
    );

    console.log("🎯 Available events for swiping:", {
      total: events.length,
      liked: likedEvents.length,
      rejected: rejectedEvents.length,
      available: availableEvents.length,
    });

    return availableEvents;
  };

  // Handle swipe right (like)
  const handleSwipeRight = (item: EventData) => {
    console.log("✅ Liked event:", item.id, item.title);

    setLikedEvents((prev) => {
      if (!prev.includes(item.id)) {
        return [...prev, item.id];
      }
      return prev;
    });

    // Remove from rejected if it was previously rejected
    setRejectedEvents((prev) => prev.filter((id) => id !== item.id));
  };

  // Handle swipe left (reject)
  const handleSwipeLeft = (item: EventData) => {
    console.log("❌ Rejected event:", item.id, item.title);

    setRejectedEvents((prev) => {
      if (!prev.includes(item.id)) {
        return [...prev, item.id];
      }
      return prev;
    });

    // Remove from liked if it was previously liked
    setLikedEvents((prev) => prev.filter((id) => id !== item.id));
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
    const totalSwipedEvents = likedEvents.length + rejectedEvents.length;

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

        {totalSwipedEvents > 0 && (
          <Text
            style={[
              Typography.caption,
              {
                color: colors.icon,
                marginTop: 10,
                textAlign: "center",
              },
            ]}
          >
            You've swiped on {totalSwipedEvents} events
          </Text>
        )}

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

  // Get available events (excluding already swiped ones)
  const availableEvents = getAvailableEvents();

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

          {/* Show swipe progress */}
          {events.length > 0 && (
            <Text
              style={[Typography.caption, { color: colors.icon, marginTop: 4 }]}
            >
              {availableEvents.length} of {events.length} events remaining
            </Text>
          )}
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
          data={availableEvents} // Only show events that haven't been swiped
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
  debugButton: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
});
