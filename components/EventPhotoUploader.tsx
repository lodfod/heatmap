import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { Typography } from "../constants/Typography";
import { useColorScheme } from "../hooks/useColorScheme";

interface EventPhotoUploaderProps {
  eventId: string;
  onPhotoAdded: (uri: string) => void;
  existingPhotos?: string[];
}

export function EventPhotoUploader({
  eventId,
  onPhotoAdded,
  existingPhotos = [],
}: EventPhotoUploaderProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  // Select photo from gallery
  const pickImage = async () => {
    setLoading(true);

    // Request permission
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      setLoading(false);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    setLoading(false);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      onPhotoAdded(result.assets[0].uri);
      setModalVisible(false);
    }
  };

  // Take a photo with camera
  const takePhoto = async () => {
    setLoading(true);

    // Request permission
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      setLoading(false);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    setLoading(false);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      onPhotoAdded(result.assets[0].uri);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[Typography.headingSmall, { color: colors.text }]}>
          Photos ({existingPhotos.length})
        </Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={[Typography.bodySmall, { color: colors.tint }]}>
            Add Photo
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.photosGrid}>
        {existingPhotos.length > 0 ? (
          <FlatList
            data={existingPhotos}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `photo-${index}`}
            renderItem={({ item }) => (
              <View style={styles.photoItem}>
                <Image
                  source={{ uri: item }}
                  style={styles.photoThumbnail}
                  contentFit="cover"
                />
              </View>
            )}
            ListFooterComponent={
              <TouchableOpacity
                style={[
                  styles.addPhotoButton,
                  {
                    backgroundColor: colors.cardBackground,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setModalVisible(true)}
              >
                <Ionicons name="add" size={32} color={colors.tint} />
              </TouchableOpacity>
            }
          />
        ) : (
          <TouchableOpacity
            style={[
              styles.emptyState,
              {
                backgroundColor: colors.cardBackground,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="images-outline" size={40} color={colors.icon} />
            <Text
              style={[
                Typography.bodyMedium,
                { color: colors.text, marginTop: 12 },
              ]}
            >
              Add photos to this event
            </Text>
            <Text
              style={[
                Typography.caption,
                { color: colors.icon, marginTop: 4, textAlign: "center" },
              ]}
            >
              Share your experience by uploading photos from this event
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Photo Upload Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.cardBackground },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[Typography.headingMedium, { color: colors.text }]}>
                Add a Photo
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text
              style={[
                Typography.bodyMedium,
                { color: colors.text, marginBottom: 20 },
              ]}
            >
              Share your experience at this event with others
            </Text>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.accent1 }]}
              onPress={pickImage}
              disabled={loading}
            >
              <Ionicons name="images-outline" size={24} color="#FFF" />
              <Text
                style={[
                  Typography.buttonMedium,
                  { color: "#FFF", marginLeft: 12 },
                ]}
              >
                Choose from Gallery
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalButton,
                { backgroundColor: colors.accent2, marginTop: 12 },
              ]}
              onPress={takePhoto}
              disabled={loading}
            >
              <Ionicons name="camera-outline" size={24} color="#FFF" />
              <Text
                style={[
                  Typography.buttonMedium,
                  { color: "#FFF", marginLeft: 12 },
                ]}
              >
                Take a Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalButton,
                { backgroundColor: "transparent", marginTop: 12 },
              ]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[Typography.buttonMedium, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  photosGrid: {
    width: "100%",
  },
  photoItem: {
    marginRight: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  photoThumbnail: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  addPhotoButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
  },
});
