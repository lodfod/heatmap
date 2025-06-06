import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useRef, useState } from "react";
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
  onSwipeRight?: (item: EventData) => void;
  onSwipeLeft?: (item: EventData) => void;
  renderNoMoreCards: () => React.ReactNode;
}

export function SwipeCard({
  data,
  onSwipeRight,
  onSwipeLeft,
  renderNoMoreCards,
}: SwipeCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  // Keep track of the current card index
  const [cardIndex, setCardIndex] = useState(0);

  // Add state to track if a swipe is in progress
  const [isSwipingInProgress, setIsSwipingInProgress] = useState(false);

  // Create animation value for card position
  const position = useRef(new Animated.ValueXY()).current;

  // Create pan responder for handling swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      // Allow the responder to detect touch events
      onStartShouldSetPanResponder: () => !isSwipingInProgress,

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
    // Mark that swipe is in progress to prevent new gestures
    setIsSwipingInProgress(true);

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

    // Call the parent component's callback if provided
    if (direction === "right" && onSwipeRight) {
      onSwipeRight(item);
    } else if (direction === "left" && onSwipeLeft) {
      onSwipeLeft(item);
    }

    // Move to next card and reset state
    setCardIndex((prev) => prev + 1);

    // Reset position for next card AFTER state update
    position.setValue({ x: 0, y: 0 });
    setIsSwipingInProgress(false);
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
    if (!isSwipingInProgress) {
      forceSwipe(direction);
    }
  };

  // If we've gone through all cards
  if (cardIndex >= data.length) {
    return <View style={styles.container}>{renderNoMoreCards()}</View>;
  }

  // Get cards to be rendered
  const cardsToRender = data.slice(cardIndex, cardIndex + 3);

  // Render current and next cards
  return (
    <View style={styles.container}>
      {/* Render cards in reverse to get proper stacking */}
      {cardsToRender
        .map((item, index) => {
          // For non-top cards (background cards)
          if (index > 0) {
            return (
              <View
                key={item.id}
                style={[
                  styles.card,
                  {
                    zIndex: 5 - index,
                    top: 10 * index,
                    backgroundColor: colors.cardBackground,
                  },
                ]}
              >
                <CardContent item={item} colors={colors} />
              </View>
            );
          }

          // For top card (the one being swiped)
          return (
            <Animated.View
              key={item.id}
              style={[
                getCardStyle(),
                styles.card,
                {
                  zIndex: 10, // Ensure top card is always on top
                  backgroundColor: colors.cardBackground,
                },
              ]}
              {...panResponder.panHandlers}
            >
              <CardContent item={item} colors={colors} />
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
          disabled={isSwipingInProgress}
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
          disabled={isSwipingInProgress}
        >
          <Ionicons name="checkmark" size={30} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Card content component - simplified without pressable functionality
interface CardContentProps {
  item: EventData;
  colors: typeof Colors.light;
}

function CardContent({ item, colors }: CardContentProps) {
  return (
    <View style={styles.cardContent}>
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
      </View>
    </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.7)",
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
});
