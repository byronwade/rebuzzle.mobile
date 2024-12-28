import React from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface KeyboardProps {
	onKeyPress: (key: string) => void;
	disabled?: boolean;
	keyState?: {
		[key: string]: "correct" | "incorrect" | "unused" | undefined;
	};
}

const keyboardLayout = [
	["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
	["A", "S", "D", "F", "G", "H", "J", "K", "L"],
	["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

export function Keyboard({ onKeyPress, disabled, keyState = {} }: KeyboardProps) {
	const getKeyStyle = (key: string) => {
		const state = keyState[key];
		if (state === "correct") return styles.keyCorrect;
		if (state === "incorrect") return styles.keyIncorrect;
		if (state === "unused") return styles.keyUnused;
		return undefined;
	};

	const getKeyTextStyle = (key: string) => {
		const state = keyState[key];
		if (state === "correct" || state === "incorrect") return styles.keyTextLight;
		if (state === "unused") return styles.keyTextDark;
		return undefined;
	};

	return (
		<ThemedView style={styles.container}>
			{keyboardLayout.map((row, rowIndex) => (
				<View key={rowIndex} style={styles.row}>
					{rowIndex === 1 && <View style={styles.halfSpacer} />}
					{row.map((key) => {
						const isBackspace = key === "BACKSPACE";
						const isEnter = key === "ENTER";
						const isSpecial = isBackspace || isEnter;

						return (
							<TouchableOpacity key={key} onPress={() => !disabled && onKeyPress(key)} disabled={disabled} style={[styles.key, isBackspace && styles.wideKey, isEnter && styles.enterKey, disabled && styles.disabledKey, isSpecial && styles.specialKey, !isSpecial && getKeyStyle(key)]} activeOpacity={0.7}>
								{isBackspace ? (
									<View style={styles.backspaceContent}>
										<ThemedText style={styles.backspaceArrow}>←</ThemedText>
										{Platform.OS !== "android" && <ThemedText style={styles.backspaceText}>DEL</ThemedText>}
									</View>
								) : (
									<ThemedText style={[styles.keyText, isEnter && styles.enterText, disabled && styles.disabledText, !isSpecial && getKeyTextStyle(key)]}>{key}</ThemedText>
								)}
							</TouchableOpacity>
						);
					})}
					{rowIndex === 1 && <View style={styles.halfSpacer} />}
				</View>
			))}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 4,
		paddingBottom: Platform.OS === "ios" ? 24 : 16,
		paddingTop: 8,
		backgroundColor: "#F9FAFB",
		borderTopWidth: 1,
		borderTopColor: "#E5E7EB",
	},
	row: {
		flexDirection: "row",
		justifyContent: "center",
		marginBottom: 4,
	},
	key: {
		height: 56,
		minWidth: 32,
		borderRadius: 6,
		backgroundColor: "#FFFFFF",
		alignItems: "center",
		justifyContent: "center",
		marginHorizontal: 2,
		paddingHorizontal: 12,
		borderWidth: 1,
		borderColor: "#E5E7EB",
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: 0.1,
				shadowRadius: 1,
			},
			android: {
				elevation: 2,
			},
		}),
	},
	wideKey: {
		flex: 1.5,
		maxWidth: 80,
	},
	enterKey: {
		flex: 1.2,
		maxWidth: 65,
	},
	specialKey: {
		backgroundColor: "#F3F4F6",
	},
	disabledKey: {
		opacity: 0.5,
	},
	keyText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1F2937",
	},
	disabledText: {
		color: "#9CA3AF",
	},
	enterText: {
		fontSize: 12,
	},
	backspaceContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	backspaceArrow: {
		fontSize: 20,
		color: "#1F2937",
	},
	backspaceText: {
		fontSize: 12,
		fontWeight: "600",
		color: "#1F2937",
	},
	halfSpacer: {
		flex: 0.5,
	},
	keyCorrect: {
		backgroundColor: "#22C55E",
		borderColor: "#16A34A",
	},
	keyIncorrect: {
		backgroundColor: "#EF4444",
		borderColor: "#DC2626",
	},
	keyUnused: {
		backgroundColor: "#9CA3AF",
		borderColor: "#6B7280",
	},
	keyTextLight: {
		color: "#FFFFFF",
	},
	keyTextDark: {
		color: "#4B5563",
	},
});
