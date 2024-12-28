import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabBarBackground() {
	const colorScheme = useColorScheme();

	if (Platform.OS === "ios") {
		return <BlurView intensity={80} style={StyleSheet.absoluteFill} tint={colorScheme === "dark" ? "dark" : "light"} />;
	}

	return null;
}

export function useBottomTabOverflow() {
	return Platform.OS === "ios" ? 35 : 15;
}
