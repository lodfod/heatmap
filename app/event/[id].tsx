import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { EventPhotoUploader } from "../../components/EventPhotoUploader";
import { Colors } from "../../constants/Colors";
import { Typography } from "../../constants/Typography";
import { getEventById } from "../../data/events";
import { useColorScheme } from "../../hooks/useColorScheme";
import { Event } from "../../lib/supabase";

// Define types for our event data - keeping these for the UI components
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

// Enhanced event details that includes database data + UI-specific data
interface EventDetails extends Event {
  organizer?: string;
  attendees?: EventAttendee[];
  photos?: string[];
  comments?: EventComment[];
  isAttending?: boolean;
  imageUrl?: string;
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();

  // State for event data and user interactions
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAttending, setIsAttending] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  // Load event data from database
  useEffect(() => {
    const loadEvent = async () => {
      try {
        const dbEvent = await getEventById(id as string);
        if (dbEvent) {
          // Convert database event to UI event format with default values
          const uiEvent: EventDetails = {
            ...dbEvent,
            imageUrl:
              dbEvent.img_path ||
              "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
            organizer: "Event Organizer", // Default organizer since it's not in DB
            attendees: [], // Default empty array for attendees
            photos: [], // Default empty array for photos
            comments: [], // Default empty array for comments
            isAttending: false, // Default not attending
          };
          setEvent(uiEvent);
          setIsAttending(uiEvent.isAttending || false);
        }
      } catch (error) {
        console.error("Error loading event:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

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

  // Handle adding a new photo to the event
  const handleAddPhoto = (photoUri: string) => {
    if (!event) return;

    // In a real app, this would upload the photo to a server
    // and then update the event with the new photo URL

    // For this demo, we'll just add it to the local state
    setEvent({
      ...event,
      photos: [photoUri, ...(event.photos || [])],
    });

    // Show success message
    Alert.alert(
      "Photo Added",
      "Your photo has been added to the event gallery!",
      [{ text: "OK" }]
    );
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text
            style={[
              Typography.bodyMedium,
              { color: colors.text, marginTop: 16 },
            ]}
          >
            Loading event...
          </Text>
        </View>
      </View>
    );
  }

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
                {event.date || "Date TBD"}
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
                {event.location || "Location TBD"}
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
                Organized by {event.organizer || "Event Organizer"}
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
              {event.description || "No description available."}
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[Typography.headingSmall, { color: colors.text }]}>
                Attendees ({(event.attendees || []).length})
              </Text>
              <TouchableOpacity>
                <Text style={[Typography.bodySmall, { color: colors.tint }]}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            {event.attendees && event.attendees.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.attendeesContainer}
              >
                {event.attendees.map((attendee) => (
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
            ) : (
              <Text style={[Typography.bodyMedium, { color: colors.icon }]}>
                No attendees yet. Be the first to attend!
              </Text>
            )}
          </View>

          {/* Photo Section - Replace with EventPhotoUploader if attending */}
          <View style={styles.section}>
            {isAttending ? (
              <EventPhotoUploader
                eventId={event.id}
                onPhotoAdded={handleAddPhoto}
                existingPhotos={event.photos || []}
              />
            ) : (
              <>
                <View style={styles.sectionHeader}>
                  <Text
                    style={[Typography.headingSmall, { color: colors.text }]}
                  >
                    Photos ({(event.photos || []).length})
                  </Text>
                  {(event.photos || []).length > 4 && (
                    <TouchableOpacity
                      onPress={() => setShowAllPhotos(!showAllPhotos)}
                    >
                      <Text
                        style={[Typography.bodySmall, { color: colors.tint }]}
                      >
                        {showAllPhotos ? "See Less" : "See All"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {event.photos && event.photos.length > 0 ? (
                  <View style={styles.photosGrid}>
                    {event.photos
                      .slice(0, showAllPhotos ? event.photos.length : 4)
                      .map((photo, index) => (
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
                ) : (
                  <Text style={[Typography.bodyMedium, { color: colors.icon }]}>
                    No photos yet.
                  </Text>
                )}

                <TouchableOpacity
                  style={[
                    styles.attendToAddPhotosButton,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={toggleAttendance}
                >
                  <Text style={[Typography.bodyMedium, { color: colors.tint }]}>
                    Attend this event to add photos
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[Typography.headingSmall, { color: colors.text }]}>
                Comments ({(event.comments || []).length})
              </Text>
              <TouchableOpacity>
                <Text style={[Typography.bodySmall, { color: colors.tint }]}>
                  Add Comment
                </Text>
              </TouchableOpacity>
            </View>

            {event.comments && event.comments.length > 0 ? (
              event.comments.map((comment) => (
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
              ))
            ) : (
              <Text style={[Typography.bodyMedium, { color: colors.icon }]}>
                No comments yet. Be the first to comment!
              </Text>
            )}
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
  attendToAddPhotosButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
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
