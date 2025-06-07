import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import { EventCard } from "../../components/EventCard";
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
  }
];

const mockAttendingEvents = [
  {
    id: "301",
    title: "Spring Concert Series",
    date: "Saturday, Jun 8, 2023 • 8:00 PM",
    location: "Frost Amphitheater",
    imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3",
    attendees: 124,
  }
];

type TabType = "created" | "attending";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { width } = useWindowDimensions();

  // State for active tab
  const [activeTab, setActiveTab] = useState<TabType>("created");

  // Handle RSVP action
  const handleRSVP = (id: string) => {
    console.log("RSVP for event:", id);
  };

  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileTextInput, setProfileTextInput] = useState(userProfile?.profile_text || "");
  const [nameInput, setNameInput] = useState(userProfile?.name || "");


  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          // Log only if it's not the "no rows" error
          console.error("Error fetching profile:", error);
        } else if (data) {
          setUserProfile(data);
        }
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);



  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: userProfile?.profileImage || defaultUser.profileImage }}
          style={styles.profileImage}
          resizeMode="cover"
        />

        <View style={styles.profileInfo}>
          <Text style={[Typography.headingMedium, { color: colors.text }]}>
            {userProfile?.name || defaultUser.name}
          </Text>

          {isEditing ? (
            <>
              <TextInput
                value={profileTextInput}
                onChangeText={setProfileTextInput}
                placeholder="Write something fun!"
                multiline
                style={{
                  marginTop: 8,
                  padding: 8,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 8,
                  color: colors.text,
                  minHeight: 60,
                }}
              />
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Your name"
                style={{
                  marginTop: 8,
                  padding: 8,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 8,
                  color: colors.text,
                }}
              />

              <View style={{ flexDirection: "row", marginTop: 8 }}>
                <TouchableOpacity
                  onPress={async () => {
  console.log("Saving new info...");
  
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("User not authenticated", authError);
    return;
  }

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        name: nameInput,
        profile_text: profileTextInput,
        
      },
      { onConflict: 'id' }
    );

  if (error) {
    console.error("Error upserting profile:", error);
  } else {
    setUserProfile((prev: any) => ({
      ...prev,
      name: nameInput,
      profile_text: profileTextInput,
    }));
    setIsEditing(false);
  }
}}


                  style={{ marginRight: 16 }}
                >
                  <Text style={{ color: colors.tint }}>Save</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {
                  setIsEditing(false);
                  setNameInput(userProfile?.name || defaultUser.name);
                  setProfileTextInput(userProfile?.profile_text || defaultUser.profile_text);
                }}>
                  <Text style={{ color: colors.text }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text
              style={[Typography.bodySmall, { color: colors.text, marginTop: 8 }]}
            >
              {userProfile?.profile_text || defaultUser.profile_text}
            </Text>
          )}
        </View>
      </View>

      {/* Edit Profile Button */}
      {!isEditing && (
        <TouchableOpacity
          onPress={() => {
            setNameInput(userProfile?.name || defaultUser.name);
            setProfileTextInput(userProfile?.profile_text || defaultUser.profile_text);
            setIsEditing(true);
          }}
          style={[
            styles.editButton,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[Typography.buttonMedium, { color: colors.text }]}>
            Edit Profile
          </Text>
        </TouchableOpacity>
      )}


      {/* Events Tabs */}
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
              { color: activeTab === "created" ? colors.tint : colors.text },
            ]}
          >
            Created Events
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
              { color: activeTab === "attending" ? colors.tint : colors.text },
            ]}
          >
            Attending
          </Text>
        </TouchableOpacity>
      </View>

      {/* Event List */}
      <View style={styles.eventsContainer}>
        {activeTab === "created" ? (
          mockCreatedEvents.length > 0 ? (
            mockCreatedEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                date={event.date}
                location={event.location}
                imageUrl={event.imageUrl}
                attendees={event.attendees}
              />
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="calendar-outline" size={50} color={colors.icon} />
              <Text
                style={[
                  Typography.bodyMedium,
                  { color: colors.text, marginTop: 16, textAlign: "center" },
                ]}
              >
                You haven&apos;t created any events yet.
              </Text>
              <TouchableOpacity
                style={[
                  styles.createEventButton,
                  { backgroundColor: colors.tint },
                ]}
              >
                <Text style={[Typography.buttonSmall, { color: "#FFF" }]}>
                  Create First Event
                </Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
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
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  followInfo: {
    flexDirection: "row",
    marginTop: 12,
  },
  followItem: {
    marginRight: 24,
  },
  editButton: {
    marginHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    marginBottom: 24,
  },
  sectionContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  friendsScrollView: {
    marginTop: 12,
  },
  friendCard: {
    width: 120,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    alignItems: "center",
  },
  friendImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  followButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  eventsContainer: {
    paddingBottom: 30,
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  createEventButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});
