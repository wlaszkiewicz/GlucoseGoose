import * as ImagePicker from "expo-image-picker";
import alert from "./alert";

export const takePhoto = async () => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Error", "Camera permission is required to take photos");
      return;
    }

    return await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });
  } catch (error) {
    console.error("Error taking photo:", error);
    alert("Error", "Failed to take photo");
    return null;
  }
};

export const pickImage = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Error", "Photo library permission is required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });
    return result;
  } catch (error) {
    console.error("Error picking image:", error);
    alert("Error", "Failed to pick image");
    return null;
  }
};
