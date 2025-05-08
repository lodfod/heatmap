import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { Typography } from "../constants/Typography";
import { useColorScheme } from "../hooks/useColorScheme";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;

export interface EventData {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  description: string;
  distance?: string;
}

interface SwipeCardProps {
  data: EventData[];
  onSwipeLeft: (item: EventData) => void;
  onSwipeRight: (item: EventData) => void;
  renderNoMoreCards: () => React.ReactNode;
}

export function SwipeCard({
  data,
  onSwipeLeft,
  onSwipeRight,
  renderNoMoreCards,
}: SwipeCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const router = useRouter();

  // Keep track of the current card index
  const [cardIndex, setCardIndex] = React.useState(0);

  // Create animation value for card position
  const position = useRef(new Animated.ValueXY()).current;

  // Create pan responder for handling swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      // Allow the responder to detect touch events
      onStartShouldSetPanResponder: () => true,

      // Handle card drag
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },

      // Handle release of card
      onPanResponderRelease: (event, gesture) => {
        // If swiped far enough to the right
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe("right");
        }
        // If swiped far enough to the left
        else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe("left");
        }
        // Otherwise, return to center
        else {
          resetPosition();
        }
      },
    })
  ).current;

  // Reset the card position
  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  // Force swipe animation
  const forceSwipe = (direction: "left" | "right") => {
    const x = direction === "right" ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;

    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  // Handle swipe completion
  const onSwipeComplete = (direction: "left" | "right") => {
    const item = data[cardIndex];

    direction === "right" ? onSwipeRight(item) : onSwipeLeft(item);

    // Reset position for next card
    position.setValue({ x: 0, y: 0 });

    // Move to next card
    setCardIndex(cardIndex + 1);
  };

  // Calculate card rotation based on position
  const getCardStyle = () => {
    // Create interpolation for rotation
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ["-30deg", "0deg", "30deg"],
    });

    // Return transform style
    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    };
  };

  // Manually swipe the current card
  const swipeCard = (direction: "left" | "right") => {
    forceSwipe(direction);
  };

  // Navigate to event details
  const goToEventDetails = (id: string) => {
    router.push(`/event/${id}`);
  };

  // If we've gone through all cards
  if (cardIndex >= data.length) {
    return <View style={styles.container}>{renderNoMoreCards()}</View>;
  }

  // Render current and next cards
  return (
    <View style={styles.container}>
      {/* Render next few cards */}
      {data
        .map((item, i) => {
          // Skip cards that have been swiped
          if (i < cardIndex) {
            return null;
          }

          // If not the top card, render with lower zIndex
          if (i > cardIndex) {
            return (
              <View
                key={item.id}
                style={[
                  styles.card,
                  {
                    zIndex: 5 - (i - cardIndex),
                    opacity: 0.9 - (i - cardIndex) * 0.2,
                    top: 10 * (i - cardIndex),
                    backgroundColor: colors.cardBackground,
                  },
                ]}
              >
                <CardContent item={item} colors={colors} />
              </View>
            );
          }

          // Render top card with animation
          return (
            <Animated.View
              key={item.id}
              style={[
                getCardStyle(),
                styles.card,
                { backgroundColor: colors.cardBackground },
              ]}
              {...panResponder.panHandlers}
            >
              <CardContent
                item={item}
                colors={colors}
                onPress={() => goToEventDetails(item.id)}
              />
            </Animated.View>
          );
        })
        .reverse()}

      {/* Swipe buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.rejectButton,
            { backgroundColor: colors.error },
          ]}
          onPress={() => swipeCard("left")}
        >
          <Ionicons name="close" size={30} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.acceptButton,
            { backgroundColor: colors.success },
          ]}
          onPress={() => swipeCard("right")}
        >
          <Ionicons name="checkmark" size={30} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Card content component
interface CardContentProps {
  item: EventData;
  colors: typeof Colors.light;
  onPress?: () => void;
}

function CardContent({ item, colors, onPress }: CardContentProps) {
  return (
    <TouchableOpacity
      style={styles.cardContent}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={!onPress}
    >
      {/* Event Image */}
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        contentFit="cover"
        transition={200}
      />

      {/* Event Info Overlay */}
      <View style={styles.overlay}>
        <View style={styles.textContainer}>
          <Text
            style={[Typography.eventTitle, { color: "#FFF" }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <Text style={[Typography.eventDate, { color: "#FFF", opacity: 0.9 }]}>
            {item.date}
          </Text>

          <Text
            style={[Typography.eventLocation, { color: "#FFF", opacity: 0.8 }]}
            numberOfLines={1}
          >
            {item.location}
          </Text>

          {item.distance && (
            <Text style={[Typography.caption, { color: "#FFF", opacity: 0.7 }]}>
              {item.distance} away
            </Text>
          )}
        </View>

        {onPress && (
          <View style={styles.seeMoreContainer}>
            <Text style={[Typography.buttonSmall, { color: "#FFF" }]}>
              See Details
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#FFF" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 20,
  },
  card: {
    position: "absolute",
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 1.3,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  cardContent: {
    width: "100%",
    height: "100%",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  textContainer: {
    marginBottom: 10,
  },
  buttonsContainer: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  rejectButton: {
    marginRight: 20,
  },
  acceptButton: {
    marginLeft: 20,
  },
  seeMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
});
