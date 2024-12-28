import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Alert, TouchableOpacity, Platform, TouchableWithoutFeedback, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { GuessBoxes } from "./GuessBoxes";
import { Keyboard } from "./Keyboard";
import { ThemedText } from "./ThemedText";
import { GameData, GameState, GameStats, MAX_ATTEMPTS, checkGuess, saveGameState, loadGameState, saveGameStats, loadGameStats, calculatePoints, calculateHintPenalty, getLevel, updateExtendedStats } from "@/lib/gameLogic";
import { Share } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface GameBoardProps {
	puzzle: GameData;
}

function ProgressBar({ points }: { points: number }) {
	const { level, nextLevelPoints } = getLevel(points);
	const prevLevelPoints = (level - 1) * 1000;
	const progress = (points - prevLevelPoints) / (nextLevelPoints - prevLevelPoints);

	return (
		<View style={styles.progressContainer}>
			<View style={styles.progressHeader}>
				<ThemedText style={styles.levelText}>Level {level}</ThemedText>
				<ThemedText style={styles.pointsText}>{points.toLocaleString()} points</ThemedText>
			</View>
			<View style={styles.progressBarContainer}>
				<View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
			</View>
			<ThemedText style={styles.nextLevelText}>
				{(nextLevelPoints - points).toLocaleString()} points to Level {level + 1}
			</ThemedText>
		</View>
	);
}

function StreakIndicator({ streak }: { streak: number }) {
	return (
		<View style={styles.streakContainer}>
			<View style={[styles.streakBadge, streak > 0 && styles.activeStreakBadge]}>
				<Ionicons name="flame" size={20} color={streak > 0 ? "#FFFFFF" : "#9CA3AF"} />
				<ThemedText style={[styles.streakText, streak > 0 && styles.activeStreakText]}>{streak}</ThemedText>
			</View>
		</View>
	);
}

function CountdownTimer({ gameOver }: { gameOver: boolean }) {
	const [timeLeft, setTimeLeft] = useState("");

	useEffect(() => {
		if (!gameOver) return;

		const calculateTimeLeft = () => {
			const now = new Date();
			const tomorrow = new Date(now);
			tomorrow.setDate(tomorrow.getDate() + 1);
			tomorrow.setHours(0, 0, 0, 0);

			const diff = tomorrow.getTime() - now.getTime();
			const hours = Math.floor(diff / (1000 * 60 * 60));
			const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((diff % (1000 * 60)) / 1000);

			return `${hours}h ${minutes}m ${seconds}s`;
		};

		setTimeLeft(calculateTimeLeft());
		const timer = setInterval(() => {
			setTimeLeft(calculateTimeLeft());
		}, 1000);

		return () => clearInterval(timer);
	}, [gameOver]);

	if (!gameOver) return null;

	return (
		<View style={styles.countdownContainer}>
			<View style={styles.countdownBadge}>
				<Ionicons name="time" size={20} color="#6B7280" />
				<ThemedText style={styles.countdownText}>Next puzzle in</ThemedText>
			</View>
			<ThemedText style={styles.timeText}>{timeLeft}</ThemedText>
		</View>
	);
}

export function GameBoard({ puzzle }: GameBoardProps) {
	const [gameState, setGameState] = useState<GameState>({
		currentGuess: "",
		attemptsLeft: MAX_ATTEMPTS,
		gameOver: false,
		wasSuccessful: false,
		usedHints: [],
		lastSubmittedGuess: null,
		keyboardState: {},
	});
	const [shake, setShake] = useState(false);
	const [stats, setStats] = useState<GameStats>({
		points: 0,
		streak: 0,
		totalGames: 0,
		wins: 0,
		level: 1,
		lastPlayDate: null,
		extended: {
			averageAttempts: 0,
			totalHintsUsed: 0,
			perfectGames: 0,
			fastestSolve: null,
			longestStreak: 0,
			gamesPerLevel: {},
			achievements: [],
		},
	});
	const startTimeRef = useRef<number>(Date.now());
	const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
	const keyboardAnimation = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Promise.all([loadGameState(), loadGameStats()]).then(([savedState, savedStats]) => {
			if (savedState) {
				setGameState(savedState);
			}
			if (savedStats) {
				setStats(savedStats);
			}
			startTimeRef.current = Date.now();
		});
	}, []);

	useEffect(() => {
		if (gameState.gameOver) {
			saveGameState(gameState);
			updateGameStats();
		}
	}, [gameState.gameOver]);

	const updateGameStats = async () => {
		const currentStats = await loadGameStats();
		const solveTime = Date.now() - startTimeRef.current;

		if (gameState.wasSuccessful) {
			const hintPenalty = calculateHintPenalty(gameState.usedHints);
			const points = calculatePoints(true, currentStats.streak) * (1 - hintPenalty);
			const newStats = {
				...currentStats,
				points: currentStats.points + points,
				streak: currentStats.streak + 1,
				totalGames: currentStats.totalGames + 1,
				wins: currentStats.wins + 1,
				lastPlayDate: new Date().toISOString(),
				extended: updateExtendedStats(currentStats, gameState, solveTime),
			};
			setStats(newStats);
			await saveGameStats(newStats);

			// Check for newly unlocked achievements
			const newAchievements = newStats.extended.achievements.filter((a) => a.unlocked && !currentStats.extended.achievements.find((b) => b.id === a.id)?.unlocked);

			if (newAchievements.length > 0) {
				setTimeout(() => {
					newAchievements.forEach((achievement) => {
						Alert.alert("Achievement Unlocked! 🏆", `${achievement.title}\n${achievement.description}`, [{ text: "OK" }]);
					});
				}, 1000);
			}
		} else {
			const newStats = {
				...currentStats,
				streak: 0,
				totalGames: currentStats.totalGames + 1,
				lastPlayDate: new Date().toISOString(),
				extended: updateExtendedStats(currentStats, gameState),
			};
			setStats(newStats);
			await saveGameStats(newStats);
		}
	};

	const updateKeyboardState = (guess: string, isCorrect: boolean) => {
		const newKeyboardState = { ...gameState.keyboardState };
		const normalizedAnswer = puzzle.answer.toLowerCase().replace(/[^a-zA-Z]/g, "");

		guess.split("").forEach((letter, index) => {
			const lowerLetter = letter.toLowerCase();
			if (isCorrect) {
				newKeyboardState[lowerLetter] = "correct";
			} else if (normalizedAnswer.includes(lowerLetter)) {
				if (newKeyboardState[lowerLetter] !== "correct") {
					newKeyboardState[lowerLetter] = "incorrect";
				}
			} else {
				if (!newKeyboardState[lowerLetter]) {
					newKeyboardState[lowerLetter] = "unused";
				}
			}
		});

		return newKeyboardState;
	};

	const handleKeyPress = async (key: string) => {
		if (gameState.gameOver) return;

		Haptics.selectionAsync();

		if (key === "BACKSPACE") {
			setGameState((prev) => ({
				...prev,
				currentGuess: prev.currentGuess.slice(0, -1),
			}));
		} else if (key === "ENTER") {
			if (gameState.currentGuess.length < 1) {
				setShake(true);
				setTimeout(() => setShake(false), 500);
				Alert.alert("Error", "Please enter a guess");
				return;
			}

			const { correct } = await checkGuess(gameState.currentGuess, puzzle.answer);
			const newKeyboardState = updateKeyboardState(gameState.currentGuess, correct);

			if (correct) {
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
				setGameState((prev) => ({
					...prev,
					gameOver: true,
					wasSuccessful: true,
					lastSubmittedGuess: prev.currentGuess,
					keyboardState: newKeyboardState,
				}));
			} else {
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
				setShake(true);
				setTimeout(() => setShake(false), 500);
				const newAttemptsLeft = gameState.attemptsLeft - 1;
				setGameState((prev) => ({
					...prev,
					attemptsLeft: newAttemptsLeft,
					gameOver: newAttemptsLeft === 0,
					wasSuccessful: false,
					currentGuess: "",
					lastSubmittedGuess: prev.currentGuess,
					keyboardState: newKeyboardState,
				}));
			}
		} else {
			setGameState((prev) => ({
				...prev,
				currentGuess: prev.currentGuess + key,
			}));
		}
	};

	const handleUseHint = (hintIndex: number) => {
		if (!gameState.usedHints.includes(hintIndex)) {
			Haptics.selectionAsync();
			setGameState((prev) => ({
				...prev,
				usedHints: [...prev.usedHints, hintIndex],
			}));
		}
	};

	const handleShare = async () => {
		if (!gameState.gameOver) return;

		const emoji = gameState.wasSuccessful ? "🎉" : "😢";
		const attemptsUsed = MAX_ATTEMPTS - gameState.attemptsLeft;
		const shareText = `Rebuzzle ${emoji}\n\nPuzzle: ${puzzle.rebusPuzzle}\nSolved in ${attemptsUsed}/${MAX_ATTEMPTS} attempts\nPoints: ${stats.points}\nLevel: ${stats.level}`;

		try {
			await Share.share({
				message: shareText,
			});
			Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		} catch (error) {
			console.error("Error sharing:", error);
		}
	};

	const showGameOverAlert = () => {
		const message = gameState.wasSuccessful ? `Congratulations! 🎉\nYou solved it in ${MAX_ATTEMPTS - gameState.attemptsLeft + 1} attempts!\nPoints earned: ${calculatePoints(true, stats.streak) * (1 - calculateHintPenalty(gameState.usedHints))}` : `Game Over\nThe answer was: ${puzzle.answer}`;

		Alert.alert(gameState.wasSuccessful ? "You Won!" : "Game Over", message, [{ text: "Share", onPress: handleShare }, { text: "OK" }]);
	};

	useEffect(() => {
		if (gameState.gameOver) {
			showGameOverAlert();
		}
	}, [gameState.gameOver]);

	useEffect(() => {
		Animated.timing(keyboardAnimation, {
			toValue: isKeyboardVisible ? 1 : 0,
			duration: 250,
			useNativeDriver: true,
		}).start();
	}, [isKeyboardVisible]);

	const handleGuessBoxPress = () => {
		if (!gameState.gameOver) {
			setIsKeyboardVisible(true);
			Haptics.selectionAsync();
		}
	};

	const handleBackgroundPress = () => {
		setIsKeyboardVisible(false);
	};

	return (
		<TouchableWithoutFeedback onPress={handleBackgroundPress}>
			<View style={styles.container}>
				<View style={styles.scrollArea}>
					<View style={styles.header}>
						<View style={styles.topBar}>
							<ProgressBar points={stats.points} />
							<StreakIndicator streak={stats.streak} />
						</View>
						<ThemedText type="title" style={styles.rebus}>
							{puzzle.rebusPuzzle}
						</ThemedText>

						<View style={styles.hintsContainer}>
							{puzzle.hints.map((hint, index) => (
								<TouchableOpacity key={index} onPress={() => handleUseHint(index)} disabled={gameState.usedHints.includes(index)} style={[styles.hintButton, gameState.usedHints.includes(index) && styles.usedHintButton]}>
									<ThemedText style={[styles.hintText, gameState.usedHints.includes(index) && styles.usedHintText]}>{gameState.usedHints.includes(index) ? hint : `Hint ${index + 1}`}</ThemedText>
								</TouchableOpacity>
							))}
						</View>
					</View>

					<TouchableWithoutFeedback onPress={handleGuessBoxPress}>
						<View style={styles.gameArea}>
							<GuessBoxes currentGuess={gameState.currentGuess} answer={puzzle.answer} gameOver={gameState.gameOver} lastSubmittedGuess={gameState.lastSubmittedGuess} shake={shake} />
							<CountdownTimer gameOver={gameState.gameOver} />
						</View>
					</TouchableWithoutFeedback>
				</View>

				{!gameState.gameOver && (
					<Animated.View
						style={[
							styles.keyboardContainer,
							{
								transform: [
									{
										translateY: keyboardAnimation.interpolate({
											inputRange: [0, 1],
											outputRange: [300, 0],
										}),
									},
								],
								opacity: keyboardAnimation,
							},
						]}
					>
						<Keyboard
							onKeyPress={(key) => {
								handleKeyPress(key);
								if (key === "ENTER") {
									setIsKeyboardVisible(false);
								}
							}}
							disabled={gameState.gameOver}
							keyState={gameState.keyboardState}
						/>
					</Animated.View>
				)}
			</View>
		</TouchableWithoutFeedback>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	scrollArea: {
		flex: 1,
		padding: 16,
	},
	header: {
		alignItems: "center",
		gap: 20,
		width: "100%",
	},
	gameArea: {
		flex: 1,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
		gap: 24,
		paddingBottom: 24,
	},
	keyboardContainer: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		backgroundColor: "#F9FAFB",
		borderTopWidth: 1,
		borderTopColor: "#E5E7EB",
		paddingTop: 8,
		paddingBottom: Platform.OS === "ios" ? 24 : 16,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: -2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 8,
	},
	topBar: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
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
	rebus: {
		fontSize: 56,
		marginVertical: 16,
		textAlign: "center",
		fontWeight: "700",
	},
	hintsContainer: {
		gap: 12,
		width: "100%",
		paddingHorizontal: 16,
	},
	hintButton: {
		backgroundColor: "#F9FAFB",
		padding: 16,
		borderRadius: 12,
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#E5E7EB",
		...Platform.select({
			ios: {
				shadowColor: "#000",
				shadowOffset: { width: 0, height: 1 },
				shadowOpacity: 0.05,
				shadowRadius: 4,
			},
			android: {
				elevation: 2,
			},
		}),
	},
	usedHintButton: {
		backgroundColor: "#F3F4F6",
		borderColor: "#D1D5DB",
	},
	hintText: {
		fontSize: 16,
		color: "#4B5563",
		fontWeight: "500",
	},
	usedHintText: {
		color: "#6B7280",
	},
	progressContainer: {
		flex: 1,
		gap: 6,
	},
	progressHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	levelText: {
		fontSize: 18,
		fontWeight: "700",
		color: "#1F2937",
	},
	pointsText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#6B7280",
	},
	nextLevelText: {
		fontSize: 12,
		color: "#9CA3AF",
		textAlign: "right",
	},
	progressBarContainer: {
		height: 6,
		backgroundColor: "#F3F4F6",
		borderRadius: 3,
		overflow: "hidden",
	},
	progressBar: {
		height: "100%",
		backgroundColor: "#8B5CF6",
		borderRadius: 3,
	},
	streakContainer: {
		marginLeft: 16,
	},
	streakBadge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#F3F4F6",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 20,
		gap: 4,
	},
	activeStreakBadge: {
		backgroundColor: "#EF4444",
	},
	streakText: {
		fontSize: 16,
		fontWeight: "700",
		color: "#6B7280",
	},
	activeStreakText: {
		color: "#FFFFFF",
	},
	countdownContainer: {
		alignItems: "center",
		gap: 8,
		backgroundColor: "#F9FAFB",
		padding: 16,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	countdownBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	countdownText: {
		fontSize: 14,
		color: "#6B7280",
		fontWeight: "500",
	},
	timeText: {
		fontSize: 28,
		fontWeight: "700",
		color: "#1F2937",
		letterSpacing: -0.5,
	},
});
