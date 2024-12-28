import React, { useState, useEffect } from "react";
import { StyleSheet, Platform, ActivityIndicator } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { GameBoard } from "../../components/GameBoard";
import { SafeAreaView } from "react-native-safe-area-context";
import { getDailyPuzzle, saveDailyPuzzle, GameData } from "@/lib/gameLogic";

export default function HomeScreen() {
	const [currentPuzzle, setCurrentPuzzle] = useState<GameData | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function loadDailyPuzzle() {
			try {
				const puzzle = await getDailyPuzzle();
				await saveDailyPuzzle(puzzle);
				setCurrentPuzzle(puzzle);
			} catch (error) {
				console.error("Error loading daily puzzle:", error);
			} finally {
				setIsLoading(false);
			}
		}

		loadDailyPuzzle();
	}, []);

	if (isLoading) {
		return (
			<SafeAreaView style={styles.safeArea}>
				<ThemedView style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#8B5CF6" />
				</ThemedView>
			</SafeAreaView>
		);
	}

	if (!currentPuzzle) {
		return null;
	}

	return (
		<SafeAreaView style={styles.safeArea}>
			<ThemedView style={styles.container}>
				<GameBoard puzzle={currentPuzzle} />
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
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
