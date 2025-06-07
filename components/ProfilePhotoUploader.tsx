import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { Typography } from "../constants/Typography";
import { useColorScheme } from "../hooks/useColorScheme";
import { supabase } from "../lib/supabase";

interface ProfilePhotoUploaderProps {
  currentImageUrl?: string;
  onImageUpdated: (newImageUrl: string) => void;
  size?: number;
}

export function ProfilePhotoUploader({
  currentImageUrl,
  onImageUpdated,
  size = 120,
}: ProfilePhotoUploaderProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  // Upload image to Supabase Storage
  const uploadImageToStorage = async (imageUri: string): Promise<string> => {
    console.log("📸 Starting profile photo upload...");

    try {
      // Get current user
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error("User not authenticated");
      }

      // Generate file info
      const timestamp = Date.now();
      const fileExt = imageUri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `profile-${timestamp}.${fileExt}`;
      const filePath = `${userData.user.id}/${fileName}`;

      console.log("📸 Will upload to path:", filePath);

      // Delete old profile photo if it exists
      if (currentImageUrl && currentImageUrl.includes("supabase")) {
        try {
          const oldPath = currentImageUrl.split("/profile-photos/")[1];
          if (oldPath) {
            await supabase.storage.from("profile-photos").remove([oldPath]);
            console.log("🗑️ Deleted old profile photo");
          }
        } catch (deleteError) {
          console.log("⚠️ Could not delete old photo:", deleteError);
        }
      }

      // Create FormData with the file
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: `image/${fileExt}`,
        name: fileName,
      } as any);

      // Get a signed upload URL from Supabase
      const { data: uploadData, error: signedUrlError } = await supabase.storage
        .from("profile-photos")
        .createSignedUploadUrl(filePath);

      if (signedUrlError) {
        throw signedUrlError;
      }

      // Upload using fetch with FormData
      const uploadResponse = await fetch(uploadData.signedUrl, {
        method: "PUT",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(
          `Upload failed: ${uploadResponse.status} - ${errorText}`
        );
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("profile-photos")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error("❌ Profile photo upload failed:", error);
      throw error;
    }
  };

  // Update profile in database
  const updateProfileInDatabase = async (imageUrl: string) => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const { error } = await supabase.from("profiles").upsert(
      {
        id: userData.user.id,
        imageUrl: imageUrl,
      },
      { onConflict: "id" }
    );

    if (error) {
      throw error;
    }
  };

  // Handle complete photo update process
  const handlePhotoUpdate = async (imageUri: string) => {
    try {
      setUploading(true);

      // Upload image to storage
      const newImageUrl = await uploadImageToStorage(imageUri);
      console.log("✅ Profile photo uploaded to:", newImageUrl);

      // Update profile in database
      await updateProfileInDatabase(newImageUrl);
      console.log("✅ Profile updated in database");

      // Call callback to update UI
      onImageUpdated(newImageUrl);

      setModalVisible(false);
      Alert.alert("Success", "Your profile photo has been updated!");
    } catch (error) {
      console.error("❌ Error updating profile photo:", error);
      Alert.alert(
        "Upload Failed",
        "Failed to update profile photo. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setUploading(false);
    }
  };

  // Select photo from gallery
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission needed",
        "Please allow access to your photo library to update your profile photo."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile photos
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await handlePhotoUpdate(result.assets[0].uri);
    }
  };

  // Take a photo with camera
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission needed",
        "Please allow camera access to take a profile photo."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile photos
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await handlePhotoUpdate(result.assets[0].uri);
    }
  };

  const radius = size / 2;
  const overlaySize = 36;
  const containerSize = size + 20; // Extra space for the overlay

  return (
    <View style={styles.container}>
      {/* Outer container that provides space for the overlay */}
      <View
        style={[
          styles.outerContainer,
          { width: containerSize, height: containerSize },
        ]}
      >
        {/* Profile photo container */}
        <View
          style={[
            styles.photoContainer,
            { width: size, height: size, borderRadius: radius },
          ]}
        >
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            disabled={uploading}
            style={[
              styles.touchableArea,
              { width: size, height: size, borderRadius: radius },
            ]}
          >
            <Image
              source={{
                uri:
                  currentImageUrl ||
                  "https://images.unsplash.com/photo-1650902565793-c2eb262aefbc",
              }}
              style={[
                styles.profileImage,
                { width: size, height: size, borderRadius: radius },
              ]}
              contentFit="cover"
            />

            {uploading && (
              <View
                style={[
                  styles.uploadingOverlay,
                  { width: size, height: size, borderRadius: radius },
                ]}
              >
                <ActivityIndicator size="small" color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Camera overlay - positioned absolutely within the larger container */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          disabled={uploading}
          style={[
            styles.editOverlay,
            {
              backgroundColor: colors.tint,
              width: overlaySize,
              height: overlaySize,
              borderRadius: overlaySize / 2,
              // Position relative to the outer container
              position: "absolute",
              bottom: 0,
              right: 0,
            },
          ]}
        >
          <Ionicons name="camera" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Photo Selection Modal */}
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
                Update Profile Photo
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.accent1 }]}
              onPress={pickImage}
              disabled={uploading}
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
              style={[styles.modalButton, { backgroundColor: colors.accent2 }]}
              onPress={takePhoto}
              disabled={uploading}
            >
              <Ionicons name="camera-outline" size={24} color="#FFF" />
              <Text
                style={[
                  Typography.buttonMedium,
                  { color: "#FFF", marginLeft: 12 },
                ]}
              >
                Take Photo
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
    alignItems: "center",
    justifyContent: "center",
  },
  outerContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  photoContainer: {
    position: "relative",
    overflow: "hidden",
  },
  touchableArea: {
    position: "relative",
  },
  profileImage: {
    // Size and border radius are set dynamically
  },
  editOverlay: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
});
