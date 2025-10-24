// ============================================================================
// COMPONENT: PrayerNotificationModal
// Location: components/PrayerNotificationModal.tsx
// Modal for configuring individual prayer notifications
// ============================================================================

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import {
  NotificationMode,
  PrayerName,
  PrayerNotificationSettings,
  getNotificationIcon,
  getNotificationLabel,
} from "../types/prayerNotifications";
import {
  NOTIFICATION_SOUNDS,
  getSoundById,
} from "../constants/notificationSounds";

interface PrayerNotificationModalProps {
  visible: boolean;
  prayerName: PrayerName;
  currentSettings: PrayerNotificationSettings;
  onClose: () => void;
  onSave: (settings: PrayerNotificationSettings) => void;
}

export default function PrayerNotificationModal({
  visible,
  prayerName,
  currentSettings,
  onClose,
  onSave,
}: PrayerNotificationModalProps) {
  const [mode, setMode] = useState<NotificationMode>(currentSettings.mode);
  const [soundId, setSoundId] = useState<string>(currentSettings.soundId);
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const prayerLabel = prayerName.charAt(0).toUpperCase() + prayerName.slice(1);

  const handleSave = () => {
    onSave({ mode, soundId });
    onClose();
  };

  const handleCancel = () => {
    // Reset to current settings
    setMode(currentSettings.mode);
    setSoundId(currentSettings.soundId);
    stopSound();
    onClose();
  };

  const playPreview = async (id: string) => {
    try {
      // Stop any currently playing sound
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      setPlayingSound(id);

      const soundFile = getSoundById(id);
      if (!soundFile) return;

      const { sound: newSound } = await Audio.Sound.createAsync(
        soundFile.file,
        { shouldPlay: true }
      );

      setSound(newSound);

      // Auto-stop when finished
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingSound(null);
        }
      });
    } catch (error) {
      console.error("Error playing sound:", error);
      setPlayingSound(null);
    }
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setPlayingSound(null);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const notificationModes: {
    mode: NotificationMode;
    iconName: string;
    iconColor: string;
    label: string;
  }[] = [
    {
      mode: "sound",
      iconName: "notifications",
      iconColor: "#1e3a8a",
      label: "Sound + Vibrate",
    },
    {
      mode: "vibrate",
      iconName: "volume-mute-outline",
      iconColor: "#f59e0b",
      label: "Vibrate Only",
    },
    {
      mode: "off",
      iconName: "notifications-off",
      iconColor: "#9ca3af",
      label: "Off",
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{prayerLabel} Notification</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Notification Type Selection */}
            <Text style={styles.sectionTitle}>Notification Type</Text>
            {notificationModes.map((item) => (
              <TouchableOpacity
                key={item.mode}
                style={[
                  styles.modeOption,
                  mode === item.mode && styles.modeOptionSelected,
                ]}
                onPress={() => setMode(item.mode)}
              >
                <View style={styles.modeLeft}>
                  <Ionicons
                    name={item.iconName as any}
                    size={28}
                    color={item.iconColor}
                  />
                  <Text
                    style={[
                      styles.modeLabel,
                      mode === item.mode && styles.modeLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
                <Ionicons
                  name={
                    mode === item.mode ? "radio-button-on" : "radio-button-off"
                  }
                  size={24}
                  color={mode === item.mode ? "#1e3a8a" : "#d1d5db"}
                />
              </TouchableOpacity>
            ))}

            {/* Sound Selection (only if mode is 'sound') */}
            {mode === "sound" && (
              <>
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Select Sound</Text>
                {NOTIFICATION_SOUNDS.map((soundItem) => (
                  <TouchableOpacity
                    key={soundItem.id}
                    style={[
                      styles.soundOption,
                      soundId === soundItem.id && styles.soundOptionSelected,
                    ]}
                    onPress={() => setSoundId(soundItem.id)}
                  >
                    <View style={styles.soundLeft}>
                      <Ionicons
                        name={
                          soundId === soundItem.id
                            ? "radio-button-on"
                            : "radio-button-off"
                        }
                        size={24}
                        color={soundId === soundItem.id ? "#1e3a8a" : "#d1d5db"}
                      />
                      <View style={styles.soundInfo}>
                        <Text
                          style={[
                            styles.soundLabel,
                            soundId === soundItem.id &&
                              styles.soundLabelSelected,
                          ]}
                        >
                          {soundItem.label}
                        </Text>
                        {soundItem.description && (
                          <Text style={styles.soundDescription}>
                            {soundItem.description}
                          </Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() => {
                        if (playingSound === soundItem.id) {
                          stopSound();
                        } else {
                          playPreview(soundItem.id);
                        }
                      }}
                    >
                      {playingSound === soundItem.id ? (
                        <Ionicons
                          name="stop-circle"
                          size={32}
                          color="#1e3a8a"
                        />
                      ) : (
                        <Ionicons
                          name="play-circle"
                          size={32}
                          color="#1e3a8a"
                        />
                      )}
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  modeOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  modeOptionSelected: {
    borderColor: "#1e3a8a",
    backgroundColor: "#eff6ff",
  },
  modeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  modeLabel: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
  modeLabelSelected: {
    color: "#1e3a8a",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 20,
  },
  modeIconContainer: {
    width: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  soundOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  soundOptionSelected: {
    borderColor: "#1e3a8a",
    backgroundColor: "#eff6ff",
  },
  soundLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  soundInfo: {
    flex: 1,
  },
  soundLabel: {
    fontSize: 15,
    color: "#1f2937",
    fontWeight: "500",
  },
  soundLabelSelected: {
    color: "#1e3a8a",
    fontWeight: "600",
  },
  soundDescription: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 2,
  },
  playButton: {
    padding: 4,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#1e3a8a",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
