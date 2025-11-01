import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { Theme } from "../../constants/theme";

type Option = { key: string; label: string };

type PillToggleProps = {
  options: Option[];
  value: string;
  onChange: (key: string) => void;
  style?: ViewStyle | ViewStyle[];
};

export default function PillToggle({ options, value, onChange, style }: PillToggleProps) {
  return (
    <View style={[styles.container, style]}>
      {options.map((opt) => {
        const selected = opt.key === value;
        return (
          <TouchableOpacity
            key={opt.key}
            onPress={() => onChange(opt.key)}
            activeOpacity={0.9}
            style={[styles.item, selected && styles.itemSelected]}
          >
            <Text style={[styles.text, selected && styles.textSelected]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Theme.colors.surface.card,
    marginHorizontal: Theme.spacing.lg,
    borderRadius: Theme.radius.pill,
    padding: 3,
    ...Theme.shadow.soft,
  },
  item: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Theme.radius.pill,
    alignItems: "center",
  },
  itemSelected: {
    backgroundColor: Theme.colors.brand.navy[700],
    shadowColor: Theme.colors.brand.navy[700],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    color: Theme.colors.text.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  textSelected: {
    color: Theme.colors.text.inverse,
  },
});
