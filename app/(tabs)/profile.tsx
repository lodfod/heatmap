import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { EventCard } from "../../components/EventCard";
import { Colors } from "../../constants/Colors";
import { Typography } from "../../constants/Typography";
import { useColorScheme } from "../../hooks/useColorScheme";

// Mock user data
const mockUser = {
  name: "Alex Johnson",
  username: "alex_j",
  profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  bio: "Stanford CS '25 | Love exploring new places and meeting new people",
  followers: 184,
  following: 245,
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
  {
    id: "202",
    title: "Study Group: AI Fundamentals",
    date: "Tuesday, Jun 4, 2023 • 4:00 PM",
    location: "Green Library",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    attendees: 6,
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
  {
    id: "302",
    title: "Hackathon 2023",
    date: "Friday-Sunday, Jun 14-16, 2023",
    location: "Huang Engineering Center",
    imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678",
    attendees: 78,
  },
  {
    id: "303",
    title: "Job Fair: Tech Companies",
    date: "Wednesday, Jun 12, 2023 • 11:00 AM",
    location: "Tresidder Union",
    imageUrl: "https://images.unsplash.com/photo-1560439513-74b037a25d84",
    attendees: 250,
  },
];

// Friend suggestion mock data
const friendSuggestions = [
  {
    id: "1",
    name: "Emma Wilson",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    mutualFriends: 4,
  },
  {
    id: "2",
    name: "Michael Brown",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    mutualFriends: 3,
  },
  {
    id: "3",
    name: "Sophia Chen",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
    mutualFriends: 5,
  },
  {
    id: "4",
    name: "David Kim",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    mutualFriends: 2,
  },
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: mockUser.profileImage }}
          style={styles.profileImage}
          resizeMode="cover"
        />

        <View style={styles.profileInfo}>
          <Text style={[Typography.headingMedium, { color: colors.text }]}>
            {mockUser.name}
          </Text>

          <Text
            style={[Typography.bodySmall, { color: colors.text, marginTop: 8 }]}
          >
            {mockUser.bio}
          </Text>
        </View>
      </View>

      {/* Edit Profile Button */}
      <TouchableOpacity
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
