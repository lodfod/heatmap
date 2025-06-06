import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { Typography } from "../constants/Typography";
import { EventData } from "./SwipeCard";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface LikedEventsViewProps {
  likedEvents: EventData[];
  colors: typeof Colors.light;
  onBack: () => void;
  onEventPress?: (event: EventData) => void;
}

export function LikedEventsView({
  likedEvents,
  colors,
  onBack,
  onEventPress,
}: LikedEventsViewProps) {
  const router = useRouter();

  // Handle event card press - navigate to event detail page
  const handleEventPress = (event: EventData) => {
    // Call the optional onEventPress callback if provided
    onEventPress?.(event);

    // Navigate to event detail page
    router.push(`/event/${event.id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.backButton,
            { backgroundColor: colors.cardBackground },
          ]}
          onPress={onBack}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[Typography.headingLarge, { color: colors.text }]}>
          Liked Events
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      {likedEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={80} color={colors.icon} />
          <Text
            style={[
              Typography.headingMedium,
              { color: colors.text, marginTop: 20 },
            ]}
          >
            No Liked Events
          </Text>
          <Text
            style={[
              Typography.bodyMedium,
              {
                color: colors.text,
                opacity: 0.7,
                marginTop: 10,
                textAlign: "center",
              },
            ]}
          >
            Start swiping to find events you love!
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {likedEvents.map((event, index) => (
            <TouchableOpacity
              key={event.id}
              style={[
                styles.eventCard,
                { backgroundColor: colors.cardBackground },
                index === likedEvents.length - 1 && styles.lastCard,
              ]}
              onPress={() => handleEventPress(event)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: event.imageUrl }}
                style={styles.eventImage}
                contentFit="cover"
                transition={200}
              />

              <View style={styles.eventContent}>
                <View style={styles.eventInfo}>
                  <Text
                    style={[Typography.eventTitle, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {event.title}
                  </Text>

                  <View style={styles.eventDetails}>
                    <View style={styles.detailRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={colors.icon}
                      />
                      <Text
                        style={[
                          Typography.eventDate,
                          { color: colors.text, marginLeft: 6 },
                        ]}
                      >
                        {event.date}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color={colors.icon}
                      />
                      <Text
                        style={[
                          Typography.eventLocation,
                          { color: colors.text, marginLeft: 6, flex: 1 },
                        ]}
                        numberOfLines={1}
                      >
                        {event.location}
                      </Text>
                    </View>

                    {event.distance && (
                      <View style={styles.detailRow}>
                        <Ionicons
                          name="walk-outline"
                          size={16}
                          color={colors.icon}
                        />
                        <Text
                          style={[
                            Typography.caption,
                            { color: colors.text, marginLeft: 6, opacity: 0.7 },
                          ]}
                        >
                          {event.distance} away
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.likedIndicator}>
                  <Ionicons name="heart" size={20} color={colors.success} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholder: {
    width: 40,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Extra space for tab bar
  },
  eventCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lastCard: {
    marginBottom: 32,
  },
  eventImage: {
    width: "100%",
    height: 200,
  },
  eventContent: {
    flexDirection: "row",
    padding: 16,
  },
  eventInfo: {
    flex: 1,
  },
  eventDetails: {
    marginTop: 8,
    gap: 6,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  likedIndicator: {
    marginLeft: 12,
    justifyContent: "center",
  },
});
