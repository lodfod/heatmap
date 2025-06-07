import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { EventCard } from "../../components/EventCard";
import { Colors } from "../../constants/Colors";
import { Typography } from "../../constants/Typography";
import { getAllEvents } from "../../data/events";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();

  // State for events data
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load events function (extracted for reuse)
  const loadEvents = async () => {
    try {
      const allEvents = await getAllEvents();
      console.log("📱 Home: Loaded events:", allEvents.length);

      // Debug log for first few events to check image URLs
      allEvents.slice(0, 3).forEach((event, index) => {
        console.log(`📷 Event ${index + 1} image URL:`, event.imageUrl);
      });

      setEvents(allEvents);
    } catch (error) {
      console.error("❌ Home: Error loading events:", error);
      setEvents([]);
    }
  };

  // Initial load
  useEffect(() => {
    loadEvents();
  }, []);

  // Handle pull to refresh
  const onRefresh = async () => {
    console.log("🔄 Refreshing events...");
    setRefreshing(true);

    try {
      await loadEvents();
      console.log("✅ Events refreshed successfully");
    } catch (error) {
      console.error("❌ Error refreshing events:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle RSVP action
  const handleRSVP = (id: string) => {
    // In a real app, this would make an API call to update RSVP status
    console.log("RSVP for event:", id);

    // For demo purposes, just update the UI to show one more attendee
    setEvents(
      events.map((event) =>
        event.id === id
          ? { ...event, attendees: (event.attendees || 0) + 1 }
          : event
      )
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      <View style={styles.header}>
        <Text style={[Typography.headingLarge, { color: colors.text }]}>
          Upcoming Events
        </Text>
        <Text
          style={[
            Typography.bodyMedium,
            { color: colors.text, opacity: 0.7, marginTop: 8 },
          ]}
        >
          Music events happening around campus
        </Text>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <EventCard
            id={item.id}
            title={item.title}
            date={item.date}
            location={item.location}
            imageUrl={item.imageUrl}
            attendees={item.attendees}
            onRSVP={handleRSVP}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint} // Color of the refresh indicator
            title="Pull to refresh events" // iOS only
            titleColor={colors.text} // iOS only
            colors={[colors.tint]} // Android only - array of colors
            progressBackgroundColor={colors.cardBackground} // Android only
          />
        }
      />
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
  listContent: {
    paddingBottom: 80,
  },
});
