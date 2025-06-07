import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";
import { Typography } from "../constants/Typography";
import { useColorScheme } from "../hooks/useColorScheme";
import { supabase } from "../lib/supabase";

interface EventPhoto {
  id: string;
  photo_url: string;
  caption?: string;
  uploaded_by: string;
  created_at: string;
}

interface EventPhotoUploaderProps {
  eventId: string;
  onPhotoAdded?: (photo: EventPhoto) => void;
}

export function EventPhotoUploader({
  eventId,
  onPhotoAdded,
}: EventPhotoUploaderProps) {
  const [photos, setPhotos] = useState<EventPhoto[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  // Load existing photos from database
  useEffect(() => {
    loadEventPhotos();
  }, [eventId]);

  const loadEventPhotos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("event_photos")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading event photos:", error);
        return;
      }

      setPhotos(data || []);
    } catch (error) {
      console.error("Error loading photos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Upload image to Supabase Storage
  const uploadImageToStorage = async (imageUri: string): Promise<string> => {
    console.log("📸 Starting event photo upload...");

    try {
      // Generate file info
      const timestamp = Date.now();
      const fileExt = imageUri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `event-${eventId}-photo-${timestamp}.${fileExt}`;
      const filePath = `event-photos/${eventId}/${fileName}`;

      console.log("📸 Will upload to path:", filePath);

      // Create FormData with the file
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        type: `image/${fileExt}`,
        name: fileName,
      } as any);

      // Get a signed upload URL from Supabase
      const { data: uploadData, error: signedUrlError } = await supabase.storage
        .from("event-photos")
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
        .from("event-photos")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error("❌ Photo upload failed:", error);
      throw error;
    }
  };

  // Save photo to database
  const savePhotoToDatabase = async (
    photoUrl: string,
    caption: string
  ): Promise<EventPhoto> => {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("event_photos")
      .insert([
        {
          event_id: eventId,
          photo_url: photoUrl,
          caption: caption.trim() || null,
          uploaded_by: userData.user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  };

  // Handle photo upload process
  const handlePhotoUpload = async () => {
    if (!selectedImageUri) return;

    try {
      setUploading(true);

      // Upload image to storage
      const photoUrl = await uploadImageToStorage(selectedImageUri);
      console.log("✅ Photo uploaded to:", photoUrl);

      // Save to database
      const newPhoto = await savePhotoToDatabase(photoUrl, caption);
      console.log("✅ Photo saved to database:", newPhoto);

      // Update local state
      setPhotos([newPhoto, ...photos]);

      // Call callback if provided
      if (onPhotoAdded) {
        onPhotoAdded(newPhoto);
      }

      // Reset modal state
      setSelectedImageUri(null);
      setCaption("");
      setModalVisible(false);

      Alert.alert("Success", "Your photo has been added to the event!");
    } catch (error) {
      console.error("❌ Error uploading photo:", error);
      Alert.alert(
        "Upload Failed",
        "Failed to upload photo. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setUploading(false);
    }
  };

  // Select photo from gallery
  const pickImage = async () => {
    // Request permission
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission needed",
        "Please allow access to your photo library to upload photos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImageUri(result.assets[0].uri);
    }
  };

  // Take a photo with camera
  const takePhoto = async () => {
    // Request permission
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission needed",
        "Please allow camera access to take photos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImageUri(result.assets[0].uri);
    }
  };

  // Close modal and reset state
  const closeModal = () => {
    setModalVisible(false);
    setSelectedImageUri(null);
    setCaption("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[Typography.headingSmall, { color: colors.text }]}>
          Photos ({photos.length})
        </Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={[Typography.bodySmall, { color: colors.tint }]}>
            Add Photo
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.tint} />
          <Text
            style={[Typography.caption, { color: colors.icon, marginLeft: 8 }]}
          >
            Loading photos...
          </Text>
        </View>
      ) : (
        <View style={styles.photosGrid}>
          {photos.length > 0 ? (
            <FlatList
              data={photos}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.photoItem}>
                  <Image
                    source={{ uri: item.photo_url }}
                    style={styles.photoThumbnail}
                    contentFit="cover"
                  />
                  {item.caption && (
                    <Text
                      style={[Typography.caption, { color: colors.text }]}
                      numberOfLines={2}
                    >
                      {item.caption}
                    </Text>
                  )}
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
      )}

      {/* Photo Upload Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
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
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {!selectedImageUri ? (
              <>
                <Text
                  style={[
                    Typography.bodyMedium,
                    { color: colors.text, marginBottom: 20 },
                  ]}
                >
                  Share your experience at this event with others
                </Text>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: colors.accent1 },
                  ]}
                  onPress={pickImage}
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
                    { backgroundColor: colors.accent2 },
                  ]}
                  onPress={takePhoto}
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
              </>
            ) : (
              <>
                <Image
                  source={{ uri: selectedImageUri }}
                  style={styles.previewImage}
                  contentFit="cover"
                />

                <Text
                  style={[
                    Typography.bodySmall,
                    { color: colors.text, marginTop: 16, marginBottom: 8 },
                  ]}
                >
                  Add a caption (optional)
                </Text>

                <TextInput
                  style={[
                    styles.captionInput,
                    {
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="What's happening in this photo?"
                  placeholderTextColor={colors.icon}
                  value={caption}
                  onChangeText={setCaption}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[
                      styles.modalButtonSecondary,
                      { borderColor: colors.border },
                    ]}
                    onPress={() => setSelectedImageUri(null)}
                  >
                    <Text
                      style={[Typography.buttonMedium, { color: colors.text }]}
                    >
                      Choose Different
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalButtonPrimary,
                      {
                        backgroundColor: colors.tint,
                        opacity: uploading ? 0.6 : 1,
                      },
                    ]}
                    onPress={handlePhotoUpload}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <ActivityIndicator size="small" color="#FFF" />
                        <Text
                          style={[
                            Typography.buttonMedium,
                            { color: "#FFF", marginLeft: 8 },
                          ]}
                        >
                          Uploading...
                        </Text>
                      </>
                    ) : (
                      <Text
                        style={[Typography.buttonMedium, { color: "#FFF" }]}
                      >
                        Upload Photo
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  photosGrid: {
    paddingHorizontal: 16,
  },
  photoItem: {
    marginRight: 12,
    width: 120,
  },
  photoThumbnail: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginBottom: 4,
  },
  addPhotoButton: {
    width: 120,
    height: 90,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    padding: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
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
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  captionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalButtonSecondary: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  modalButtonPrimary: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
});
