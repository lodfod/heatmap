import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { Typography } from "../../constants/Typography";
import { useColorScheme } from "../../hooks/useColorScheme";

// Define types for our event data
interface EventAttendee {
  id: string;
  name: string;
  image: string;
}

interface EventComment {
  id: string;
  user: string;
  text: string;
  timestamp: string;
}

interface EventDetails {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  description: string;
  organizer: string;
  attendees: EventAttendee[];
  photos: string[];
  comments: EventComment[];
}

// Mock data for events
const mockEvents: Record<string, EventDetails> = {
  "1": {
    id: "1",
    title: "End of Quarter Party",
    date: "Friday, Jun 7, 2023 • 8:00 PM",
    location: "The Treehouse",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
    description:
      "Celebrate the end of a successful quarter with food, drinks, and music! Come meet fellow students and faculty in a relaxed environment. Open to all students and faculty.",
    organizer: "Student Union",
    attendees: [
      {
        id: "1",
        name: "Alex Johnson",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      },
      {
        id: "2",
        name: "Emma Wilson",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
      },
      {
        id: "3",
        name: "Michael Brown",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      },
      {
        id: "4",
        name: "Sophia Chen",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
      },
      {
        id: "5",
        name: "David Kim",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      },
    ],
    photos: [
      "https://images.unsplash.com/photo-1496024840928-4c417adf211d",
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf",
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
    ],
    comments: [
      {
        id: "1",
        user: "Emma Wilson",
        text: "Looking forward to this!",
        timestamp: "2 days ago",
      },
      {
        id: "2",
        user: "Michael Brown",
        text: "Will there be food?",
        timestamp: "1 day ago",
      },
      {
        id: "3",
        user: "Alex Johnson",
        text: "Yes, pizza and drinks will be provided!",
        timestamp: "1 day ago",
      },
    ],
  },
  "2": {
    id: "2",
    title: "CS Research Symposium",
    date: "Tuesday, Jun 4, 2023 • 3:00 PM",
    location: "Gates Computer Science Building",
    imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952",
    description:
      "Join us for the annual CS Research Symposium where students and faculty present their latest research projects. Topics include AI, machine learning, computer vision, and more.",
    organizer: "CS Department",
    attendees: [
      {
        id: "1",
        name: "Alex Johnson",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      },
      {
        id: "2",
        name: "Emma Wilson",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
      },
      {
        id: "3",
        name: "Michael Brown",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      },
    ],
    photos: [
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998",
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f",
    ],
    comments: [
      {
        id: "1",
        user: "Alex Johnson",
        text: "Will the presentations be recorded?",
        timestamp: "3 days ago",
      },
      {
        id: "2",
        user: "CS Department",
        text: "Yes, recordings will be available on our website after the event.",
        timestamp: "2 days ago",
      },
    ],
  },
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();

  // State for event data and user interactions
  const [event, setEvent] = useState<EventDetails | undefined>(
    mockEvents[id as string]
  );
  const [isAttending, setIsAttending] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  // Toggle attendance status
  const toggleAttendance = () => {
    setIsAttending(!isAttending);

    if (!isAttending) {
      // In a real app, this would make an API call to update attendance status
      Alert.alert("Success", "You are now attending this event!");
    }
  };

  // Share event with friends
  const shareEvent = async () => {
    if (!event) return;

    try {
      const result = await Share.share({
        message: `Check out this event: ${event.title} on ${event.date} at ${event.location}`,
        url: `https://events.app/event/${event.id}`,
      });
    } catch (error) {
      console.log("Error sharing event:", error);
    }
  };

  // If event not found
  if (!event) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <View style={styles.centerContainer}>
          <Text style={[Typography.headingMedium, { color: colors.text }]}>
            Event not found
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
      <StatusBar style="light" />

      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerTintColor: "#FFF",
          headerLeft: (props) => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={28} color="#FFF" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={shareEvent} style={styles.shareButton}>
              <Ionicons name="share-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Event Cover Image */}
        <Image
          source={{ uri: event.imageUrl }}
          style={styles.coverImage}
          contentFit="cover"
        />

        {/* Gradient Overlay */}
        <View style={styles.gradient} />

        {/* Event Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.headerContainer}>
            <Text style={[Typography.headingLarge, { color: colors.text }]}>
              {event.title}
            </Text>

            <TouchableOpacity
              style={[
                styles.attendButton,
                { backgroundColor: isAttending ? colors.success : colors.tint },
              ]}
              onPress={toggleAttendance}
            >
              <Text style={[Typography.buttonMedium, { color: "#FFF" }]}>
                {isAttending ? "Attending" : "Attend"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.accent1}
              />
              <Text
                style={[
                  Typography.bodyMedium,
                  { color: colors.text, marginLeft: 8 },
                ]}
              >
                {event.date}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons
                name="location-outline"
                size={20}
                color={colors.accent1}
              />
              <Text
                style={[
                  Typography.bodyMedium,
                  { color: colors.text, marginLeft: 8 },
                ]}
              >
                {event.location}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.accent1}
              />
              <Text
                style={[
                  Typography.bodyMedium,
                  { color: colors.text, marginLeft: 8 },
                ]}
              >
                Organized by {event.organizer}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[Typography.headingSmall, { color: colors.text }]}>
              About
            </Text>
            <Text
              style={[
                Typography.bodyMedium,
                { color: colors.text, lineHeight: 24, marginTop: 8 },
              ]}
            >
              {event.description}
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[Typography.headingSmall, { color: colors.text }]}>
                Attendees ({event.attendees.length})
              </Text>
              <TouchableOpacity>
                <Text style={[Typography.bodySmall, { color: colors.tint }]}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.attendeesContainer}
            >
              {event.attendees.map((attendee: EventAttendee) => (
                <View key={attendee.id} style={styles.attendeeItem}>
                  <Image
                    source={{ uri: attendee.image }}
                    style={styles.attendeeImage}
                    contentFit="cover"
                  />
                  <Text
                    style={[
                      Typography.caption,
                      { color: colors.text, marginTop: 4 },
                    ]}
                    numberOfLines={1}
                  >
                    {attendee.name.split(" ")[0]}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[Typography.headingSmall, { color: colors.text }]}>
                Photos ({event.photos.length})
              </Text>
              <TouchableOpacity
                onPress={() => setShowAllPhotos(!showAllPhotos)}
              >
                <Text style={[Typography.bodySmall, { color: colors.tint }]}>
                  {showAllPhotos ? "See Less" : "See All"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.photosGrid}>
              {event.photos
                .slice(0, showAllPhotos ? event.photos.length : 4)
                .map((photo: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.photoItem}
                    onPress={() => console.log("Open photo view")}
                  >
                    <Image
                      source={{ uri: photo }}
                      style={styles.photo}
                      contentFit="cover"
                    />
                  </TouchableOpacity>
                ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[Typography.headingSmall, { color: colors.text }]}>
                Comments ({event.comments.length})
              </Text>
              <TouchableOpacity>
                <Text style={[Typography.bodySmall, { color: colors.tint }]}>
                  Add Comment
                </Text>
              </TouchableOpacity>
            </View>

            {event.comments.map((comment: EventComment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Text
                  style={[
                    Typography.bodyMedium,
                    { color: colors.text, fontWeight: "600" },
                  ]}
                >
                  {comment.user}
                </Text>
                <Text
                  style={[
                    Typography.bodySmall,
                    { color: colors.text, marginTop: 2 },
                  ]}
                >
                  {comment.text}
                </Text>
                <Text
                  style={[
                    Typography.caption,
                    { color: colors.icon, marginTop: 4 },
                  ]}
                >
                  {comment.timestamp}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
  coverImage: {
    width: "100%",
    height: 300,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  detailsContainer: {
    padding: 20,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  attendButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  infoContainer: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  attendeesContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  attendeeItem: {
    alignItems: "center",
    marginRight: 16,
    width: 60,
  },
  attendeeImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -5,
  },
  photoItem: {
    width: "50%",
    padding: 5,
  },
  photo: {
    width: "100%",
    height: 120,
    borderRadius: 8,
  },
  commentItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
  },
});
