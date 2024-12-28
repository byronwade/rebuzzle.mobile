import React, { useMemo } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface GuessBoxesProps {
	currentGuess: string;
	answer: string;
	gameOver: boolean;
	lastSubmittedGuess: string | null;
	shake: boolean;
}

interface WordStructure {
	type: "letter" | "punctuation";
	char: string;
}

export function GuessBoxes({ currentGuess, answer, gameOver, lastSubmittedGuess, shake }: GuessBoxesProps) {
	const shakeAnimation = React.useRef(new Animated.Value(0)).current;
	const scaleAnimation = React.useRef(new Animated.Value(1)).current;

	React.useEffect(() => {
		if (shake) {
			Animated.sequence([
				Animated.timing(shakeAnimation, {
					toValue: 10,
					duration: 100,
					useNativeDriver: true,
				}),
				Animated.timing(shakeAnimation, {
					toValue: -10,
					duration: 100,
					useNativeDriver: true,
				}),
				Animated.timing(shakeAnimation, {
					toValue: 10,
					duration: 100,
					useNativeDriver: true,
				}),
				Animated.timing(shakeAnimation, {
					toValue: 0,
					duration: 100,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [shake]);

	React.useEffect(() => {
		if (currentGuess) {
			Animated.sequence([
				Animated.timing(scaleAnimation, {
					toValue: 1.1,
					duration: 100,
					useNativeDriver: true,
				}),
				Animated.timing(scaleAnimation, {
					toValue: 1,
					duration: 100,
					useNativeDriver: true,
				}),
			]).start();
		}
	}, [currentGuess]);

	const wordStructures = useMemo(() => {
		return answer.split(" ").map((word) => ({
			word,
			structure: word.split("").map((char) => ({
				type: char.match(/[.,!?]/) ? ("punctuation" as const) : ("letter" as const),
				char,
			})),
		}));
	}, [answer]);

	let guessIndex = 0;

	return (
		<Animated.View
			style={[
				styles.container,
				{
					transform: [{ translateX: shakeAnimation }],
				},
			]}
		>
			{wordStructures.map(({ word, structure }, wordIndex) => (
				<View key={`word-${wordIndex}`} style={styles.wordRow}>
					{structure.map((item, charIndex) => {
						if (item.type === "punctuation") {
							return (
								<View key={`${wordIndex}-${charIndex}`} style={styles.punctuationBox}>
									<ThemedText style={styles.punctuationText}>{item.char}</ThemedText>
								</View>
							);
						}

						const letter = gameOver ? item.char : currentGuess[guessIndex];
						const isCorrect = lastSubmittedGuess && lastSubmittedGuess[guessIndex]?.toLowerCase() === item.char.toLowerCase();
						const isIncorrect = lastSubmittedGuess && lastSubmittedGuess[guessIndex] && lastSubmittedGuess[guessIndex]?.toLowerCase() !== item.char.toLowerCase();

						const box = (
							<Animated.View
								key={`${wordIndex}-${charIndex}`}
								style={[
									styles.letterBox,
									letter && styles.letterBoxFilled,
									gameOver && styles.letterBoxGameOver,
									letter && lastSubmittedGuess && isCorrect && styles.letterBoxCorrect,
									letter && lastSubmittedGuess && isIncorrect && styles.letterBoxIncorrect,
									letter &&
										!lastSubmittedGuess && {
											transform: [{ scale: scaleAnimation }],
										},
								]}
							>
								<ThemedText style={[styles.letterText, letter && lastSubmittedGuess && (isCorrect || isIncorrect) && styles.letterTextLight]}>{gameOver ? item.char : letter || ""}</ThemedText>
							</Animated.View>
						);

						guessIndex++;
						return box;
					})}
				</View>
			))}
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		alignItems: "center",
		gap: 16,
		marginBottom: 24,
	},
	wordRow: {
		flexDirection: "row",
		gap: 6,
	},
	letterBox: {
		width: 48,
		height: 48,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderColor: "#E5E7EB",
		backgroundColor: "#FFFFFF",
	},
	letterBoxFilled: {
		transform: [{ scale: 1.05 }],
		backgroundColor: "#F3E8FF",
		borderColor: "#E9D5FF",
	},
	letterBoxGameOver: {
		backgroundColor: "#E5E7EB",
		borderColor: "#D1D5DB",
	},
	letterBoxCorrect: {
		backgroundColor: "#22C55E",
		borderColor: "#16A34A",
	},
	letterBoxIncorrect: {
		backgroundColor: "#EF4444",
		borderColor: "#DC2626",
	},
	letterText: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#1F2937",
	},
	letterTextLight: {
		color: "#FFFFFF",
	},
	punctuationBox: {
		width: 48,
		height: 48,
		alignItems: "center",
		justifyContent: "center",
	},
	punctuationText: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#6B7280",
	},
});
