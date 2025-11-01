import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Theme } from "../../constants/theme";

type CardProps = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export default function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surface.card,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    ...Theme.shadow.soft,
  },
});
