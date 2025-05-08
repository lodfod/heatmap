import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { Typography } from "../constants/Typography";
import { useColorScheme } from "../hooks/useColorScheme";

interface ImagePickerComponentProps {
  onImageSelected: (uri: string) => void;
  initialImage?: string;
  label?: string;
}

export function ImagePickerComponent({
  onImageSelected,
  initialImage,
  label = "Upload Image",
}: ImagePickerComponentProps) {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  // Request permission and pick an image
  const pickImage = async () => {
    setLoading(true);

    // Request permission
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      setLoading(false);
      return;
    }

    // Launch image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    setLoading(false);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      onImageSelected(result.assets[0].uri);
    }
  };

  // Take a photo with the camera
  const takePhoto = async () => {
    setLoading(true);

    // Request permission
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      setLoading(false);
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    setLoading(false);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      onImageSelected(result.assets[0].uri);
    }
  };

  // Remove the selected image
  const removeImage = () => {
    setImage(null);
    onImageSelected("");
  };

  return (
    <View style={styles.container}>
      <Text
        style={[Typography.bodyMedium, styles.label, { color: colors.text }]}
      >
        {label}
      </Text>

      {image ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: image }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />

          <TouchableOpacity
            style={[styles.removeButton, { backgroundColor: colors.error }]}
            onPress={removeImage}
          >
            <Ionicons name="close" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      ) : (
        <View
          style={[
            styles.placeholderContainer,
            {
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="large" color={colors.tint} />
          ) : (
            <>
              <Ionicons name="image-outline" size={48} color={colors.icon} />
              <Text
                style={[
                  Typography.bodyMedium,
                  { color: colors.icon, marginTop: 8 },
                ]}
              >
                No image selected
              </Text>
            </>
          )}
        </View>
      )}

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: colors.accent1,
              marginRight: 8,
            },
          ]}
          onPress={pickImage}
          disabled={loading}
        >
          <Ionicons name="images-outline" size={20} color="#FFF" />
          <Text
            style={[
              Typography.buttonSmall,
              styles.buttonText,
              { color: "#FFF" },
            ]}
          >
            Choose from Gallery
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent2 }]}
          onPress={takePhoto}
          disabled={loading}
        >
          <Ionicons name="camera-outline" size={20} color="#FFF" />
          <Text
            style={[
              Typography.buttonSmall,
              styles.buttonText,
              { color: "#FFF" },
            ]}
          >
            Take Photo
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonsContainer: {
    flexDirection: "row",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    marginLeft: 8,
  },
});
