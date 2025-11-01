import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { Theme } from "../../constants/theme";

type BadgeProps = {
  label: string;
  bgColor?: string;
  textColor?: string;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  pill?: boolean;
  uppercase?: boolean;
};

export default function Badge({
  label,
  bgColor = Theme.colors.border.base,
  textColor = Theme.colors.text.base,
  style,
  textStyle,
  pill = true,
  uppercase = true,
}: BadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        pill && styles.badgePill,
        { backgroundColor: bgColor },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color: textColor },
          uppercase && styles.upper,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
  },
  badgePill: {
    borderRadius: Theme.radius.pill,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  upper: {
    textTransform: "uppercase",
  },
});
