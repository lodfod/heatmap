import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { EventCard } from "../../components/EventCard";
import { Colors } from "../../constants/Colors";
import { Typography } from "../../constants/Typography";
import { useColorScheme } from "../../hooks/useColorScheme";

// Mock data for personalized events
const mockEvents = [
  {
    id: "1",
    title: "End of Quarter Party",
    date: "Friday, Jun 7, 2023 • 8:00 PM",
    location: "The Treehouse",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
    attendees: 42,
  },
  {
    id: "2",
    title: "CS Research Symposium",
    date: "Tuesday, Jun 4, 2023 • 3:00 PM",
    location: "Gates Computer Science Building",
    imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952",
    attendees: 24,
  },
  {
    id: "3",
    title: "Design Thinking Workshop",
    date: "Monday, Jun 3, 2023 • 5:30 PM",
    location: "Huang Engineering Center",
    imageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b",
    attendees: 18,
  },
  {
    id: "4",
    title: "Intramural Soccer Championship",
    date: "Saturday, Jun 8, 2023 • 2:00 PM",
    location: "Cagan Stadium",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018",
    attendees: 56,
  },
  {
    id: "5",
    title: "Alumni Networking Mixer",
    date: "Thursday, Jun 13, 2023 • 6:00 PM",
    location: "CoHo Coffee House",
    imageUrl: "https://images.unsplash.com/photo-1528605248644-14dd04022da1",
    attendees: 31,
  },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();

  // State for events data
  const [events, setEvents] = useState(mockEvents);

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
          Events for you based on your interests and friends
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
