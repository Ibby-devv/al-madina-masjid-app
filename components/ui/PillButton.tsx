import React from "react";
import { StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from "react-native";

type PillButtonProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
};

export default function PillButton({ label, selected, onPress, style, textStyle }: PillButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.base,
        selected ? styles.selected : styles.unselected,
        style,
      ]}
    >
      <Text style={[styles.textBase, selected ? styles.textSelected : styles.textUnselected, textStyle]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 22,
    borderWidth: 1,
    marginRight: 8,
    minHeight: 38,
  },
  unselected: {
    backgroundColor: "#e2e8f0",
    borderColor: "#cbd5e1",
  },
  selected: {
    backgroundColor: "#1e3a8a",
    borderColor: "#1e3a8a",
    shadowColor: "#1e3a8a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  textBase: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.2,
    lineHeight: 18,
  },
  textUnselected: {
    color: "#0f172a",
  },
  textSelected: {
    color: "#fff",
  },
});
