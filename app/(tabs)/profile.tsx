import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
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
// Mock user data
const defaultUser = {
  name: "User",
  profileImage: "https://images.unsplash.com/photo-1650902565793-c2eb262aefbc",
  profile_text: "Write something fun!",
};

// Mock events data
const mockCreatedEvents = [
  {
    id: "201",
    title: "CS Dinner Meetup",
    date: "Friday, Jun 7, 2023 • 7:30 PM",
    location: "Italian Homemade Company",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    attendees: 12,
  },
];

const mockAttendingEvents = [
  {
    id: "301",
    title: "Spring Concert Series",
    date: "Saturday, Jun 8, 2023 • 8:00 PM",
    location: "Frost Amphitheater",
    imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
    attendees: 124,
  },
];

type TabType = "created" | "attending";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { width } = useWindowDimensions();

  // State for active tab
  const [activeTab, setActiveTab] = useState<TabType>("created");

  // Profile state
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileTextInput, setProfileTextInput] = useState("");
  const [nameInput, setNameInput] = useState("");

  // Handle RSVP action
  const handleRSVP = (id: string) => {
    console.log("RSVP for event:", id);
  };

  // Load user profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
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
        }
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
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
            {mockCreatedEvents.length}
          </Text>
          <Text style={[Typography.caption, { color: colors.icon }]}>
            Events Created
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[Typography.headingSmall, { color: colors.text }]}>
            {mockAttendingEvents.length}
          </Text>
          <Text style={[Typography.caption, { color: colors.icon }]}>
            Events Attending
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[Typography.headingSmall, { color: colors.text }]}>
            87
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
            Events Created
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
            Attending
          </Text>
        </TouchableOpacity>
      </View>

      {/* Events List */}
      <View style={styles.eventsContainer}>
        {activeTab === "created" &&
          mockCreatedEvents.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              date={event.date}
              location={event.location}
              imageUrl={event.imageUrl}
              attendees={event.attendees}
              onRSVP={handleRSVP}
            />
          ))}

        {activeTab === "attending" &&
          mockAttendingEvents.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.title}
              date={event.date}
              location={event.location}
              imageUrl={event.imageUrl}
              attendees={event.attendees}
              onRSVP={handleRSVP}
            />
          ))}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  eventsContainer: {
    paddingTop: 20,
  },
});
