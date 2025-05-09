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
import { eventClusters } from "../../data/events";
import { useColorScheme } from "../../hooks/useColorScheme";

export default function ClusterDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();

  // State for cluster data
  const [cluster, setCluster] = useState(eventClusters[id as string]);
  const [sortBy, setSortBy] = useState<"date" | "popularity">("date");

  // Get events the user is attending
  const attendingEvents =
    cluster?.events.filter((event) => event.isAttending) || [];

  // Handle RSVP action
  const handleRSVP = (eventId: string) => {
    // In a real app, this would make an API call to update RSVP status
    console.log("RSVP for event:", eventId);

    // For demo purposes, just update the UI to show one more attendee
    // and mark the user as attending this event
    setCluster({
      ...cluster,
      events: cluster.events.map((event) =>
        event.id === eventId
          ? { ...event, attendees: event.attendees + 1, isAttending: true }
          : event
      ),
    });
  };

  // Navigate to add photos for a specific event
  const goToAddPhotos = (eventId: string) => {
    router.push(`/event/${eventId}`);
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

      {/* Attending Events Section */}
      {attendingEvents.length > 0 && (
        <View
          style={[
            styles.attendingEventsContainer,
            { backgroundColor: colors.cardBackground },
          ]}
        >
          <View style={styles.attendingEventsHeader}>
            <Ionicons name="camera-outline" size={20} color={colors.tint} />
            <Text
              style={[
                Typography.bodyMedium,
                { color: colors.text, marginLeft: 8, fontWeight: "600" },
              ]}
            >
              You&apos;re attending {attendingEvents.length}{" "}
              {attendingEvents.length === 1 ? "event" : "events"} in this area
            </Text>
          </View>

          <Text
            style={[
              Typography.bodySmall,
              { color: colors.text, marginBottom: 10 },
            ]}
          >
            You can add photos to these events:
          </Text>

          <View style={styles.attendingEventsList}>
            {attendingEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.attendingEventItem,
                  { borderColor: colors.border },
                ]}
                onPress={() => goToAddPhotos(event.id)}
              >
                <Text
                  style={[Typography.bodyMedium, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {event.title}
                </Text>
                <Ionicons name="camera" size={18} color={colors.tint} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

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
  attendingEventsContainer: {
    margin: 16,
    marginTop: 0,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
  },
  attendingEventsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  attendingEventsList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  attendingEventItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginRight: 8,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: "100%",
    minWidth: "45%",
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
