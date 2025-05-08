import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { EventCard } from "../../components/EventCard";
import { Colors } from "../../constants/Colors";
import { Typography } from "../../constants/Typography";
import { useColorScheme } from "../../hooks/useColorScheme";

// Mock data for event clusters
const mockClusters: Record<
  string,
  {
    id: string;
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    description: string;
    events: {
      id: string;
      title: string;
      date: string;
      location: string;
      imageUrl: string;
      attendees: number;
    }[];
  }
> = {
  cluster1: {
    id: "cluster1",
    name: "Stanford Main Campus",
    coordinates: { latitude: 37.427619, longitude: -122.170732 },
    description: "Events happening around Stanford Main Campus area.",
    events: [
      {
        id: "1",
        title: "End of Quarter Party",
        date: "Friday, Jun 7, 2023 • 8:00 PM",
        location: "The Treehouse",
        imageUrl:
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
        attendees: 42,
      },
      {
        id: "4",
        title: "Intramural Soccer Championship",
        date: "Saturday, Jun 8, 2023 • 2:00 PM",
        location: "Cagan Stadium",
        imageUrl:
          "https://images.unsplash.com/photo-1574629810360-7efbbe195018",
        attendees: 56,
      },
      {
        id: "103",
        title: "Basketball Tournament Finals",
        date: "Sunday, Jun 9, 2023 • 3:00 PM",
        location: "Maples Pavilion",
        imageUrl:
          "https://images.unsplash.com/photo-1518407613690-d9fc990e795f",
        attendees: 34,
      },
    ],
  },
  cluster2: {
    id: "cluster2",
    name: "Engineering Quad",
    coordinates: { latitude: 37.429913, longitude: -122.173648 },
    description: "Events happening at and around the Engineering Quad.",
    events: [
      {
        id: "2",
        title: "CS Research Symposium",
        date: "Tuesday, Jun 4, 2023 • 3:00 PM",
        location: "Gates Computer Science Building",
        imageUrl:
          "https://images.unsplash.com/photo-1517048676732-d65bc937f952",
        attendees: 24,
      },
      {
        id: "104",
        title: "AI Ethics Panel Discussion",
        date: "Tuesday, Jun 11, 2023 • 4:00 PM",
        location: "Gates Building, Room 104",
        imageUrl: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f",
        attendees: 18,
      },
    ],
  },
  cluster3: {
    id: "cluster3",
    name: "Tresidder Union",
    coordinates: { latitude: 37.424125, longitude: -122.166427 },
    description: "Events happening at Tresidder Union and surrounding areas.",
    events: [
      {
        id: "3",
        title: "Design Thinking Workshop",
        date: "Monday, Jun 3, 2023 • 5:30 PM",
        location: "Huang Engineering Center",
        imageUrl:
          "https://images.unsplash.com/photo-1515187029135-18ee286d815b",
        attendees: 18,
      },
      {
        id: "5",
        title: "Alumni Networking Mixer",
        date: "Thursday, Jun 13, 2023 • 6:00 PM",
        location: "CoHo Coffee House",
        imageUrl:
          "https://images.unsplash.com/photo-1528605248644-14dd04022da1",
        attendees: 31,
      },
      {
        id: "105",
        title: "Sustainable Food Festival",
        date: "Thursday, Jun 13, 2023 • 11:00 AM",
        location: "Meyer Green",
        imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033",
        attendees: 27,
      },
    ],
  },
};

export default function ClusterDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();

  // State for cluster data
  const [cluster, setCluster] = useState(mockClusters[id as string]);
  const [sortBy, setSortBy] = useState<"date" | "popularity">("date");

  // Handle RSVP action
  const handleRSVP = (eventId: string) => {
    // In a real app, this would make an API call to update RSVP status
    console.log("RSVP for event:", eventId);

    // For demo purposes, just update the UI to show one more attendee
    setCluster({
      ...cluster,
      events: cluster.events.map((event) =>
        event.id === eventId
          ? { ...event, attendees: event.attendees + 1 }
          : event
      ),
    });
  };

  // Sort events by date or popularity
  const sortedEvents = [...(cluster?.events || [])].sort((a, b) => {
    if (sortBy === "popularity") {
      return b.attendees - a.attendees;
    }

    // Sort by date (simple string comparison for demo)
    return a.date.localeCompare(b.date);
  });

  // If cluster not found
  if (!cluster) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <View style={styles.centerContainer}>
          <Text style={[Typography.headingMedium, { color: colors.text }]}>
            Location not found
          </Text>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.tint, marginTop: 20 },
            ]}
            onPress={() => router.back()}
          >
            <Text style={[Typography.buttonMedium, { color: "#FFF" }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      <Stack.Screen
        options={{
          headerShown: true,
          title: cluster.name,
          headerTintColor: colors.text,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.header}>
        <Text
          style={[
            Typography.bodyMedium,
            { color: colors.text, marginBottom: 8 },
          ]}
        >
          {cluster.description}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[Typography.headingMedium, { color: colors.text }]}>
              {cluster.events.length}
            </Text>
            <Text style={[Typography.caption, { color: colors.icon }]}>
              Events
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={[Typography.headingMedium, { color: colors.text }]}>
              {cluster.events.reduce(
                (total, event) => total + event.attendees,
                0
              )}
            </Text>
            <Text style={[Typography.caption, { color: colors.icon }]}>
              Attendees
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sortContainer}>
        <Text style={[Typography.bodyMedium, { color: colors.text }]}>
          Sort by:
        </Text>

        <TouchableOpacity
          style={[
            styles.sortOption,
            sortBy === "date" && { backgroundColor: colors.accent1 },
          ]}
          onPress={() => setSortBy("date")}
        >
          <Text
            style={[
              Typography.bodySmall,
              { color: sortBy === "date" ? "#FFF" : colors.text },
            ]}
          >
            Date
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortOption,
            sortBy === "popularity" && { backgroundColor: colors.accent1 },
          ]}
          onPress={() => setSortBy("popularity")}
        >
          <Text
            style={[
              Typography.bodySmall,
              { color: sortBy === "popularity" ? "#FFF" : colors.text },
            ]}
          >
            Popularity
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedEvents}
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

      <View style={styles.mapButtonContainer}>
        <TouchableOpacity
          style={[styles.mapButton, { backgroundColor: colors.tint }]}
          onPress={() => router.push("/map")}
        >
          <Ionicons name="map" size={20} color="#FFF" />
          <Text
            style={[Typography.buttonSmall, { color: "#FFF", marginLeft: 8 }]}
          >
            View on Map
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    marginTop: 16,
  },
  statItem: {
    marginRight: 32,
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sortOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginLeft: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  mapButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  mapButton: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
  },
});
