import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Theme } from "../../constants/theme";
import Badge from "./Badge";

type SectionHeaderProps = {
  title: string;
  containerStyle?: ViewStyle | ViewStyle[];
  rightBadge?: { label: string; bg: string; text: string } | null;
};

export default function SectionHeader({
  title,
  containerStyle,
  rightBadge,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.title}>{title}</Text>
      {rightBadge ? (
        <Badge
          label={rightBadge.label}
          bgColor={rightBadge.bg}
          textColor={rightBadge.text}
          uppercase={false}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: Theme.colors.surface.muted,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border.base,
    zIndex: 2,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: Theme.colors.text.base,
  },
});
