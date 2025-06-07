import { Ionicons } from "@expo/vector-icons";
import {
  format,
  isThisWeek,
  isThisYear,
  isToday,
  isTomorrow,
  isValid,
  parse,
  parseISO,
} from "date-fns";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
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
import { Event, supabase } from "../../lib/supabase";

interface EventPhoto {
  id: string;
  photo_url: string;
  caption?: string;
  uploaded_by: string;
  created_at: string;
}
// Define types for our event data - keeping these for the UI components
interface EventAttendee {
  id: string;
  name: string;
  imageUrl?: string;
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

// RSVP functions
const getRSVPStatus = async (
  eventId: string,
  userId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("rsvp_list")
      .select("coming")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .single();

    if (error) {
      // If no record found, user is not attending
      if (error.code === "PGRST116") {
        return false;
      }
      throw error;
    }

    return data.coming || false;
  } catch (error) {
    console.error("Error getting RSVP status:", error);
    return false;
  }
};

const updateRSVPStatus = async (
  eventId: string,
  userId: string,
  isAttending: boolean
): Promise<void> => {
  try {
    // First, try to update existing record
    const { data: updateData, error: updateError } = await supabase
      .from("rsvp_list")
      .update({ coming: isAttending })
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .select();

    // If no rows were updated, create a new record
    if (updateData && updateData.length === 0) {
      const { error: insertError } = await supabase.from("rsvp_list").insert([
        {
          event_id: eventId,
          user_id: userId,
          coming: isAttending,
        },
      ]);

      if (insertError) {
        throw insertError;
      }
    } else if (updateError) {
      throw updateError;
    }

    console.log(
      `✅ RSVP updated: ${isAttending ? "attending" : "not attending"}`
    );
  } catch (error) {
    console.error("Error updating RSVP status:", error);
    throw error;
  }
};

// Function to fetch event attendees with profile info (NO FOREIGN KEY REQUIRED)
const fetchEventAttendees = async (
  eventId: string
): Promise<EventAttendee[]> => {
  try {
    console.log("🔍 Fetching attendees for event:", eventId);

    // Step 1: Get the user IDs of people attending this event
    const { data: rsvpData, error: rsvpError } = await supabase
      .from("rsvp_list")
      .select("user_id")
      .eq("event_id", eventId)
      .eq("coming", true);

    if (rsvpError) {
      console.error("Error fetching RSVPs:", rsvpError);
      return [];
    }

    if (!rsvpData || rsvpData.length === 0) {
      console.log("📭 No attendees found for event");
      return [];
    }

    console.log(`👥 Found ${rsvpData.length} attendees, fetching profiles...`);

    // Step 2: Extract user IDs into an array
    const userIds = rsvpData.map((rsvp) => rsvp.user_id);

    // Step 3: Get profile information for those users (separate query)
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name, imageUrl")
      .in("id", userIds);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      // Continue anyway - we'll use default data for users without profiles
    }

    console.log(
      `✅ Successfully fetched ${profilesData?.length || 0} profiles`
    );

    // Step 4: Combine the data - create attendee objects for each user
    const attendees = userIds.map((userId) => {
      const profile = profilesData?.find((p) => p.id === userId);
      return {
        id: userId,
        name: profile?.name || "User", // Default name if no profile
        imageUrl: profile?.imageUrl, // Will be undefined if no profile/image
      };
    });

    console.log(`🎉 Returning ${attendees.length} attendees`);
    return attendees;
  } catch (error) {
    console.error("❌ Error in fetchEventAttendees:", error);
    return [];
  }
};

// Enhanced helper function to format dates with better error handling
const formatEventDate = (dateString: string): string => {
  // Handle null, undefined, or empty strings
  if (!dateString || dateString.trim() === "" || dateString === "Date TBD") {
    return "Date TBD";
  }

  try {
    let date: Date;

    console.log("📅 Formatting event detail date string:", dateString);

    // Try parsing as ISO string first (most common from Supabase)
    date = parseISO(dateString);

    // If parseISO fails, try other common formats
    if (!isValid(date)) {
      // Try parsing as JavaScript Date string
      date = new Date(dateString);
    }

    // If still invalid, try parsing common date formats
    if (!isValid(date)) {
      // Try MM/DD/YYYY format
      const mmddyyyy = parse(dateString, "MM/dd/yyyy", new Date());
      if (isValid(mmddyyyy)) {
        date = mmddyyyy;
      } else {
        // Try YYYY-MM-DD format
        const yyyymmdd = parse(dateString, "yyyy-MM-dd", new Date());
        if (isValid(yyyymmdd)) {
          date = yyyymmdd;
        }
      }
    }

    // Final validation
    if (!isValid(date)) {
      console.warn("❌ Could not parse event detail date:", dateString);
      return dateString; // Return original string as fallback
    }

    console.log("✅ Successfully parsed event detail date:", date);

    // Format based on how close the date is
    if (isToday(date)) {
      return `Today at ${format(date, "h:mm a")}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, "h:mm a")}`;
    } else if (isThisWeek(date)) {
      return format(date, "EEEE, MMMM d 'at' h:mm a"); // "Monday, December 25 at 7:30 PM"
    } else if (isThisYear(date)) {
      return format(date, "MMMM d 'at' h:mm a"); // "December 25 at 7:30 PM"
    } else {
      return format(date, "MMMM d, yyyy 'at' h:mm a"); // "December 25, 2024 at 7:30 PM"
    }
  } catch (error) {
    console.error("❌ Error formatting event detail date:", error);
    console.error("❌ Original event detail date string:", dateString);
    return dateString; // Fallback to original string
  }
};

// Component for displaying attendee profile picture
const AttendeeAvatar = ({
  attendee,
  size = 40,
  colors,
}: {
  attendee: EventAttendee;
  size?: number;
  colors: any;
}) => {
  if (attendee.imageUrl) {
    return (
      <Image
        source={{ uri: attendee.imageUrl }}
        style={[
          styles.attendeeAvatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
        contentFit="cover"
      />
    );
  } else {
    // Show colored circle with initials if no image
    const initials = attendee.name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();

    return (
      <View
        style={[
          styles.attendeeAvatar,
          styles.attendeeAvatarPlaceholder,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.tint,
          },
        ]}
      >
        <Text
          style={[
            Typography.caption,
            {
              color: "#FFF",
              fontSize: size * 0.35,
              fontWeight: "600",
            },
          ]}
        >
          {initials}
        </Text>
      </View>
    );
  }
};

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();

  // State for event data and user interactions
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAttending, setIsAttending] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [eventPhotos, setEventPhotos] = useState<string[]>([]);
  const [photoRefreshKey, setPhotoRefreshKey] = useState(0);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  // Function to load attendees
  const loadAttendees = useCallback(async () => {
    if (!id) return;

    setAttendeesLoading(true);
    try {
      const attendeesData = await fetchEventAttendees(id as string);
      setAttendees(attendeesData);
    } catch (error) {
      console.error("Error loading attendees:", error);
    } finally {
      setAttendeesLoading(false);
    }
  }, [id]);

  // Function to load event data and RSVP status
  const loadEventAndRSVP = useCallback(async () => {
    try {
      // Get current user
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) {
        console.error("User not authenticated");
        return;
      }

      setCurrentUserId(userData.user.id);

      // Load event data
      const dbEvent = await getEventById(id as string);
      if (dbEvent) {
        // Convert database event to UI event format with default values
        const uiEvent: EventDetails = {
          ...dbEvent,
          imageUrl:
            dbEvent.imageUrl ||
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
          organizer: "Event Organizer", // Default organizer since it's not in DB
          photos: [], // Default empty array for photos
          comments: [], // Default empty array for comments
          isAttending: false, // Will be updated below
        };
        setEvent(uiEvent);

        // Load RSVP status
        const attendingStatus = await getRSVPStatus(
          id as string,
          userData.user.id
        );
        setIsAttending(attendingStatus);
      }
    } catch (error) {
      console.error("Error loading event and RSVP:", error);
    }
  }, [id]);

  // Initial load
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await Promise.all([loadEventAndRSVP(), loadAttendees()]);
      setLoading(false);
    };
    initialLoad();
  }, [loadEventAndRSVP, loadAttendees]);

  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadEventAndRSVP(), loadAttendees()]);
    setPhotoRefreshKey((prev) => prev + 1); // Refresh photos as well
    setRefreshing(false);
  }, [loadEventAndRSVP, loadAttendees]);

  // Toggle attendance status with Supabase integration
  const toggleAttendance = async () => {
    if (!currentUserId || !event) {
      Alert.alert("Error", "You must be logged in to RSVP for events.");
      return;
    }

    if (rsvpLoading) return;

    setRsvpLoading(true);
    const newAttendingStatus = !isAttending;

    try {
      // Optimistically update the UI
      setIsAttending(newAttendingStatus);

      // Update the database
      await updateRSVPStatus(event.id, currentUserId, newAttendingStatus);

      // Refresh photos and attendees when attendance status changes
      setPhotoRefreshKey((prev) => prev + 1);
      await loadAttendees(); // Reload attendees to reflect the change

      // Show success message
      Alert.alert(
        "RSVP Updated",
        newAttendingStatus
          ? "You are now attending this event!"
          : "You are no longer attending this event.",
        [{ text: "OK" }]
      );
    } catch (error) {
      // Revert the optimistic update on error
      setIsAttending(!newAttendingStatus);

      console.error("Error updating RSVP:", error);
      Alert.alert(
        "Error",
        "There was a problem updating your RSVP. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setRsvpLoading(false);
    }
  };

  // Share event with friends
  const shareEvent = async () => {
    if (!event) return;

    try {
      const result = await Share.share({
        message: `Check out this event: ${event.title} on ${formatEventDate(
          event.date || ""
        )} at ${event.location}`,
        url: `https://heatmapp.app/event/${event.id}`,
      });
    } catch (error) {
      console.log("Error sharing event:", error);
    }
  };

  // Handle photo refresh when new photos are added
  const handlePhotoRefresh = () => {
    setPhotoRefreshKey((prev) => prev + 1);
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
      >
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

            <View style={{ paddingVertical: 10 }}>
              <TouchableOpacity
                style={[
                  styles.attendButton,
                  {
                    backgroundColor: isAttending ? colors.success : colors.tint,
                    opacity: rsvpLoading ? 0.7 : 1,
                  },
                ]}
                onPress={toggleAttendance}
                disabled={rsvpLoading}
              >
                {rsvpLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={[Typography.buttonMedium, { color: "#FFF" }]}>
                    {isAttending ? "Attending" : "Attend"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Attendees Row */}
            <View style={styles.attendeesSection}>
              {attendeesLoading ? (
                <ActivityIndicator size="small" color={colors.tint} />
              ) : attendees.length > 0 ? (
                <View style={styles.attendeesRow}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.attendeesScrollContainer}
                  >
                    {attendees.slice(0, 10).map((attendee, index) => (
                      <View
                        key={attendee.id}
                        style={[
                          styles.attendeeContainer,
                          index > 0 && styles.attendeeOverlap,
                        ]}
                      >
                        <AttendeeAvatar
                          attendee={attendee}
                          size={36}
                          colors={colors}
                        />
                      </View>
                    ))}
                    {attendees.length > 10 && (
                      <View
                        style={[
                          styles.attendeeContainer,
                          styles.attendeeOverlap,
                        ]}
                      >
                        <View
                          style={[
                            styles.attendeeMoreIndicator,
                            {
                              backgroundColor: colors.cardBackground,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              Typography.caption,
                              { color: colors.text, fontSize: 12 },
                            ]}
                          >
                            +{attendees.length - 10}
                          </Text>
                        </View>
                      </View>
                    )}
                  </ScrollView>
                  <Text
                    style={[
                      Typography.caption,
                      { color: colors.icon, marginTop: 8 },
                    ]}
                  >
                    {attendees.length}{" "}
                    {attendees.length === 1 ? "person" : "people"} attending
                  </Text>
                </View>
              ) : (
                <Text style={[Typography.caption, { color: colors.icon }]}>
                  No attendees yet. Be the first to attend!
                </Text>
              )}
            </View>
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
                {formatEventDate(event.date || "")}
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

          {/* Photo Section - Only show if attending */}
          {isAttending ? (
            <View style={styles.section}>
              <EventPhotoUploader
                key={`photo-uploader-${photoRefreshKey}`}
                eventId={event.id}
                isAttending={isAttending}
                onPhotoRefresh={handlePhotoRefresh}
              />
            </View>
          ) : (
            <View style={styles.section}>
              <View style={styles.nonAttendingPhotoMessage}>
                <View style={styles.photoMessageContainer}>
                  <Ionicons
                    name="camera-outline"
                    size={32}
                    color={colors.icon}
                    style={{ marginBottom: 12 }}
                  />
                  <Text
                    style={[
                      Typography.headingSmall,
                      {
                        color: colors.text,
                        textAlign: "center",
                        marginBottom: 8,
                      },
                    ]}
                  >
                    Event Photos
                  </Text>
                  <Text
                    style={[
                      Typography.bodyMedium,
                      {
                        color: colors.icon,
                        textAlign: "center",
                        marginBottom: 16,
                      },
                    ]}
                  >
                    Photos are only visible to event attendees. Join this event
                    to see and share photos!
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.attendToPhotosButton,
                      { backgroundColor: colors.tint },
                    ]}
                    onPress={toggleAttendance}
                    disabled={rsvpLoading}
                  >
                    {rsvpLoading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text
                        style={[Typography.buttonMedium, { color: "#FFF" }]}
                      >
                        Attend Event
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  attendButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  attendeesSection: {
    width: "100%",
    alignItems: "flex-start",
    marginTop: 16,
  },
  attendeesRow: {
    width: "100%",
  },
  attendeesScrollContainer: {
    alignItems: "center",
    paddingVertical: 4,
  },
  attendeeContainer: {
    marginRight: 8,
  },
  attendeeOverlap: {
    marginLeft: -12,
  },
  attendeeAvatar: {
    borderWidth: 2,
    borderColor: "#FFF",
  },
  attendeeAvatarPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  attendeeMoreIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
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
  nonAttendingPhotoMessage: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.1)",
    borderStyle: "dashed",
  },
  photoMessageContainer: {
    alignItems: "center",
  },
  attendToPhotosButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    minWidth: 120,
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
