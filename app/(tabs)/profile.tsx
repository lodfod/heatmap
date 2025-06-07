import { Event, supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { EventCard } from "../../components/EventCard";
import { ProfilePhotoUploader } from "../../components/ProfilePhotoUploader";
import { Colors } from "../../constants/Colors";
import { Typography } from "../../constants/Typography";
import { useColorScheme } from "../../hooks/useColorScheme";

// Interfaces for our data
interface UserProfile {
  id: string;
  name?: string;
  profile_text?: string;
  imageUrl?: string;
}

interface EventCardData {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  attendees?: number;
}

interface ProfileStats {
  eventsCreated: number;
  eventsAttending: number;
  photosShared: number;
}

type TabType = "created" | "attending";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { width } = useWindowDimensions();

  // State for active tab
  const [activeTab, setActiveTab] = useState<TabType>("created");

  // Profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileTextInput, setProfileTextInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Events state
  const [createdEvents, setCreatedEvents] = useState<EventCardData[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<EventCardData[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Statistics state
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    eventsCreated: 0,
    eventsAttending: 0,
    photosShared: 0,
  });

  // Function to fetch user's created events
  const fetchCreatedEvents = async (
    userId: string
  ): Promise<EventCardData[]> => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("created_by", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching created events:", error);
        return [];
      }

      return data.map((event: Event) => ({
        id: event.id,
        title: event.title || "Untitled Event",
        date: event.date || "Date TBD",
        location: event.location || "Location TBD",
        imageUrl:
          event.imageUrl ||
          "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
        attendees: 0, // Will be calculated separately if needed
      }));
    } catch (error) {
      console.error("Error in fetchCreatedEvents:", error);
      return [];
    }
  };

  // Function to fetch user's attending events
  const fetchAttendingEvents = async (
    userId: string
  ): Promise<EventCardData[]> => {
    try {
      const { data, error } = await supabase
        .from("rsvp_list")
        .select(
          `
          event_id,
          events (
            id,
            title,
            date,
            location,
            imageUrl
          )
        `
        )
        .eq("user_id", userId)
        .eq("coming", true);

      if (error) {
        console.error("Error fetching attending events:", error);
        return [];
      }

      return data
        .filter((rsvp) => rsvp.events) // Filter out any null events
        .map((rsvp: any) => ({
          id: rsvp.events.id,
          title: rsvp.events.title || "Untitled Event",
          date: rsvp.events.date || "Date TBD",
          location: rsvp.events.location || "Location TBD",
          imageUrl:
            rsvp.events.imageUrl ||
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
          attendees: 0, // Will be calculated separately if needed
        }));
    } catch (error) {
      console.error("Error in fetchAttendingEvents:", error);
      return [];
    }
  };

  // Function to fetch profile statistics
  const fetchProfileStats = async (userId: string): Promise<ProfileStats> => {
    try {
      // Get events created count
      const { count: eventsCreatedCount, error: createdError } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("created_by", userId);

      if (createdError) {
        console.error("Error fetching created events count:", createdError);
      }

      // Get events attending count
      const { count: eventsAttendingCount, error: attendingError } =
        await supabase
          .from("rsvp_list")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("coming", true);

      if (attendingError) {
        console.error("Error fetching attending events count:", attendingError);
      }

      // Get photos shared count
      const { count: photosSharedCount, error: photosError } = await supabase
        .from("event_photos")
        .select("*", { count: "exact", head: true })
        .eq("uploaded_by", userId);

      if (photosError) {
        console.error("Error fetching photos count:", photosError);
      }

      return {
        eventsCreated: eventsCreatedCount || 0,
        eventsAttending: eventsAttendingCount || 0,
        photosShared: photosSharedCount || 0,
      };
    } catch (error) {
      console.error("Error in fetchProfileStats:", error);
      return {
        eventsCreated: 0,
        eventsAttending: 0,
        photosShared: 0,
      };
    }
  };

  // Load user profile function (extracted for reuse)
  const fetchProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setCurrentUserId(user.id);

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching profile:", error);
        } else if (data) {
          setUserProfile(data);
          setNameInput(data.name || "");
          setProfileTextInput(data.profile_text || "");
        } else {
          // Create default profile if none exists
          setUserProfile({
            id: user.id,
            name: "User",
            profile_text: "Write something fun!",
          });
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  // Load events data
  const fetchEvents = async () => {
    if (!currentUserId) return;

    setEventsLoading(true);
    try {
      const [created, attending, stats] = await Promise.all([
        fetchCreatedEvents(currentUserId),
        fetchAttendingEvents(currentUserId),
        fetchProfileStats(currentUserId),
      ]);

      setCreatedEvents(created);
      setAttendingEvents(attending);
      setProfileStats(stats);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setEventsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const loadProfileAndEvents = async () => {
      setLoading(true);
      await fetchProfile();
      setLoading(false);
    };

    loadProfileAndEvents();
  }, []);

  // Load events when user ID is available
  useEffect(() => {
    if (currentUserId) {
      fetchEvents();
    }
  }, [currentUserId]);

  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    console.log("🔄 Refreshing profile...");
    setRefreshing(true);

    try {
      await fetchProfile();
      if (currentUserId) {
        await fetchEvents();
      }
      console.log("✅ Profile refreshed successfully");
    } catch (error) {
      console.error("❌ Error refreshing profile:", error);
    } finally {
      setRefreshing(false);
    }
  }, [currentUserId]);

  // Handle RSVP action
  const handleRSVP = (id: string) => {
    console.log("RSVP for event:", id);
    // Refresh events after RSVP action
    if (currentUserId) {
      fetchEvents();
    }
  };

  // Handle profile photo update
  const handleProfilePhotoUpdate = (newImageUrl: string) => {
    setUserProfile((prev: any) => ({
      ...prev,
      imageUrl: newImageUrl,
    }));
  };

  // Save profile changes
  const saveProfile = async () => {
    console.log("Saving profile changes...");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("User not authenticated", authError);
      return;
    }

    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        name: nameInput,
        profile_text: profileTextInput,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("Error updating profile:", error);
    } else {
      setUserProfile((prev: any) => ({
        ...prev,
        name: nameInput,
        profile_text: profileTextInput,
      }));
      setIsEditing(false);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditing(false);
    setNameInput(userProfile?.name || "");
    setProfileTextInput(userProfile?.profile_text || "");
  };

  // Loading state
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.tint} />
        <Text
          style={[Typography.bodyMedium, { color: colors.text, marginTop: 16 }]}
        >
          Loading profile...
        </Text>
      </View>
    );
  }

  const currentEvents =
    activeTab === "created" ? createdEvents : attendingEvents;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.tint}
          title="Pull to refresh profile"
          titleColor={colors.text}
          colors={[colors.tint]}
          progressBackgroundColor={colors.cardBackground}
        />
      }
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <ProfilePhotoUploader
          currentImageUrl={userProfile?.imageUrl}
          onImageUpdated={handleProfilePhotoUpdate}
          size={120}
        />

        <View style={styles.profileInfo}>
          {isEditing ? (
            <>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Your name"
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.cardBackground,
                  },
                ]}
              />
              <TextInput
                value={profileTextInput}
                onChangeText={setProfileTextInput}
                placeholder="Write something fun!"
                multiline
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.cardBackground,
                  },
                ]}
              />

              <View style={styles.editButtons}>
                <TouchableOpacity
                  onPress={saveProfile}
                  style={[styles.saveButton, { backgroundColor: colors.tint }]}
                >
                  <Text style={[Typography.buttonSmall, { color: "#FFF" }]}>
                    Save
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={cancelEditing}
                  style={[styles.cancelButton, { borderColor: colors.border }]}
                >
                  <Text
                    style={[Typography.buttonSmall, { color: colors.text }]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={[Typography.headingMedium, { color: colors.text }]}>
                {userProfile?.name || "User"}
              </Text>

              <Text
                style={[
                  Typography.bodyMedium,
                  { color: colors.icon, marginTop: 8 },
                ]}
              >
                {userProfile?.profile_text || "Write something fun!"}
              </Text>

              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={[
                  styles.editButton,
                  { backgroundColor: colors.cardBackground },
                ]}
              >
                <Ionicons name="create-outline" size={16} color={colors.tint} />
                <Text
                  style={[
                    Typography.caption,
                    { color: colors.tint, marginLeft: 4 },
                  ]}
                >
                  Edit Profile
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[Typography.headingSmall, { color: colors.text }]}>
            {profileStats.eventsCreated}
          </Text>
          <Text style={[Typography.caption, { color: colors.icon }]}>
            Events Created
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[Typography.headingSmall, { color: colors.text }]}>
            {profileStats.eventsAttending}
          </Text>
          <Text style={[Typography.caption, { color: colors.icon }]}>
            Events Attending
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[Typography.headingSmall, { color: colors.text }]}>
            {profileStats.photosShared}
          </Text>
          <Text style={[Typography.caption, { color: colors.icon }]}>
            Photos Shared
          </Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "created" && {
              borderBottomColor: colors.tint,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab("created")}
        >
          <Text
            style={[
              Typography.bodyMedium,
              {
                color: activeTab === "created" ? colors.tint : colors.icon,
              },
            ]}
          >
            Events Created ({profileStats.eventsCreated})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "attending" && {
              borderBottomColor: colors.tint,
              borderBottomWidth: 2,
            },
          ]}
          onPress={() => setActiveTab("attending")}
        >
          <Text
            style={[
              Typography.bodyMedium,
              {
                color: activeTab === "attending" ? colors.tint : colors.icon,
              },
            ]}
          >
            Attending ({profileStats.eventsAttending})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Events List */}
      <View style={styles.eventsContainer}>
        {eventsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
            <Text
              style={[
                Typography.bodyMedium,
                { color: colors.text, marginTop: 16 },
              ]}
            >
              Loading events...
            </Text>
          </View>
        ) : currentEvents.length > 0 ? (
          currentEvents.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              date={event.date}
              location={event.location}
              imageUrl={event.imageUrl}
              attendees={event.attendees}
              onRSVP={activeTab === "attending" ? undefined : handleRSVP} // Only show RSVP for created events
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons
              name={
                activeTab === "created" ? "calendar-outline" : "people-outline"
              }
              size={48}
              color={colors.icon}
            />
            <Text
              style={[
                Typography.headingSmall,
                { color: colors.text, marginTop: 16, textAlign: "center" },
              ]}
            >
              {activeTab === "created"
                ? "No Events Created Yet"
                : "No Events Attending"}
            </Text>
            <Text
              style={[
                Typography.bodyMedium,
                { color: colors.icon, marginTop: 8, textAlign: "center" },
              ]}
            >
              {activeTab === "created"
                ? "Create your first event to get started!"
                : "Find events to attend in the Discover tab."}
            </Text>
          </View>
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileInfo: {
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
    width: "100%",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  editButtons: {
    flexDirection: "row",
    marginTop: 12,
    gap: 12,
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginVertical: 10,
  },
  statItem: {
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    marginHorizontal: 20,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
  },
  eventsContainer: {
    paddingTop: 10,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 40,
  },
});
