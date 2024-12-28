import React from "react";
import { StyleSheet, Switch, Platform } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
	const [haptics, setHaptics] = React.useState(true);
	const [darkMode, setDarkMode] = React.useState(false);
	const [notifications, setNotifications] = React.useState(true);

	React.useEffect(() => {
		loadSettings();
	}, []);

	const loadSettings = async () => {
		try {
			const settings = await AsyncStorage.getItem("settings");
			if (settings) {
				const { haptics, darkMode, notifications } = JSON.parse(settings);
				setHaptics(haptics);
				setDarkMode(darkMode);
				setNotifications(notifications);
			}
		} catch (error) {
			console.error("Error loading settings:", error);
		}
	};

	const saveSettings = async (key: string, value: boolean) => {
		try {
			const settings = await AsyncStorage.getItem("settings");
			const currentSettings = settings ? JSON.parse(settings) : {};
			const newSettings = { ...currentSettings, [key]: value };
			await AsyncStorage.setItem("settings", JSON.stringify(newSettings));
		} catch (error) {
			console.error("Error saving settings:", error);
		}
	};

	const handleToggle = (setting: string, value: boolean) => {
		Haptics.selectionAsync();
		switch (setting) {
			case "haptics":
				setHaptics(value);
				break;
			case "darkMode":
				setDarkMode(value);
				break;
			case "notifications":
				setNotifications(value);
				break;
		}
		saveSettings(setting, value);
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<ThemedView style={styles.container}>
				<ThemedText type="title" style={styles.title}>
					Settings
				</ThemedText>

				<ThemedView style={styles.section}>
					<ThemedView style={styles.setting}>
						<ThemedText>Haptic Feedback</ThemedText>
						<Switch value={haptics} onValueChange={(value) => handleToggle("haptics", value)} />
					</ThemedView>

					<ThemedView style={styles.setting}>
						<ThemedText>Dark Mode</ThemedText>
						<Switch value={darkMode} onValueChange={(value) => handleToggle("darkMode", value)} />
					</ThemedView>

					<ThemedView style={styles.setting}>
						<ThemedText>Notifications</ThemedText>
						<Switch value={notifications} onValueChange={(value) => handleToggle("notifications", value)} />
					</ThemedView>
				</ThemedView>

				<ThemedText style={styles.version}>Version 1.0.0</ThemedText>
			</ThemedView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: "transparent",
	},
	container: {
		flex: 1,
		padding: 16,
		paddingTop: Platform.OS === "android" ? 40 : 0,
		paddingBottom: Platform.OS === "ios" ? 90 : 70,
	},
	title: {
		marginBottom: 32,
	},
	section: {
		backgroundColor: "#FFFFFF",
		borderRadius: 12,
		padding: 16,
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.1,
				shadowRadius: 8,
			},
			android: {
				elevation: 4,
			},
		}),
	},
	setting: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#F3F4F6",
	},
	version: {
		textAlign: "center",
		marginTop: "auto",
		marginBottom: 16,
		color: "#6B7280",
	},
});
