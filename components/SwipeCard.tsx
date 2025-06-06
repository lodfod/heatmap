import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useRef, useState, useEffect } from "react";
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

  // Use a ref to track the current index
  const indexRef = useRef(0);
  // State to trigger re-renders
  const [currentIndex, setCurrentIndex] = useState(0);
  // Track if swiping is in progress
  const [isSwipingInProgress, setIsSwipingInProgress] = useState(false);
  // Position for animation
  const position = useRef(new Animated.ValueXY()).current;
  // Track processed card IDs
  const processedCardIds = useRef(new Set<string>()).current;

  // Reset card position
  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  // Force swipe animation with direction
  const forceSwipe = (direction: "left" | "right") => {
    // Prevent multiple swipes
    if (isSwipingInProgress || indexRef.current >= data.length) {
      return;
    }

    // Lock swiping during animation
    setIsSwipingInProgress(true);

    // Calculate animation destination
    const x = direction === "right" ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;

    // Run the animation
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  // Handle swipe completion
  const onSwipeComplete = (direction: "left" | "right") => {
    // Get current card
    const currentCard = data[indexRef.current];

    if (currentCard) {
      const cardId = currentCard.id;

      // Check if this card has been processed
      if (!processedCardIds.has(cardId)) {
        // Add to processed set
        processedCardIds.add(cardId);

        // Call appropriate callback
        if (direction === "right" && onSwipeRight) {
          onSwipeRight(currentCard);
          console.log(`SwipeCard: Swiped RIGHT on event ID: ${cardId}, title: ${currentCard.title}, index: ${indexRef.current}`);
        } else if (direction === "left" && onSwipeLeft) {
          onSwipeLeft(currentCard);
          console.log(`SwipeCard: Swiped LEFT on event ID: ${cardId}, title: ${currentCard.title}, index: ${indexRef.current}`);
        }
      }
    }

    // Reset for next card
    position.setValue({ x: 0, y: 0 });
    
    // Increment index
    indexRef.current += 1;
    // Update state to trigger re-render
    setCurrentIndex(indexRef.current);
    
    // Allow swiping again
    setIsSwipingInProgress(false);
  };

  // Manual button swipe
  const swipeCard = (direction: "left" | "right") => {
    if (!isSwipingInProgress && indexRef.current < data.length) {
      forceSwipe(direction);
    }
  };

  // Pan responder for touch handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isSwipingInProgress,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe("right");
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe("left");
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  // Card rotation style
  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ["-30deg", "0deg", "30deg"],
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
    };
  };

  // No more cards check
  if (currentIndex >= data.length) {
    return <View style={styles.container}>{renderNoMoreCards()}</View>;
  }

  // Get cards to display
  const cardsToShow = data.slice(currentIndex, currentIndex + 3);

  return (
    <View style={styles.container}>
      {/* Cards - rendered in reverse for proper stacking */}
      {cardsToShow
        .map((item, index) => {
          // Background cards
          if (index > 0) {
            return (
              <View
                key={`bg-${item.id}-${currentIndex + index}`}
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

          // Top card (being swiped)
          return (
            <Animated.View
              key={`top-${item.id}-${currentIndex}`}
              style={[
                getCardStyle(),
                styles.card,
                {
                  zIndex: 10,
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

      {/* Control buttons */}
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

// Card content component
function CardContent({ 
  item, 
  colors 
}: { 
  item: EventData; 
  colors: typeof Colors.light 
}) {
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