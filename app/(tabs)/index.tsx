import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
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

  useEffect(() => {
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
    loadEvents();
  }, []);

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
