import AsyncStorage from "@react-native-async-storage/async-storage";

export interface GameData {
	rebusPuzzle: string;
	answer: string;
	id: string;
	hints: string[];
}

export interface GameState {
	currentGuess: string;
	attemptsLeft: number;
	gameOver: boolean;
	wasSuccessful: boolean;
	usedHints: number[];
	lastSubmittedGuess: string | null;
	keyboardState: {
		[key: string]: "correct" | "incorrect" | "unused" | undefined;
	};
}

export interface Achievement {
	id: string;
	title: string;
	description: string;
	icon: string;
	requirement: number;
	progress: number;
	unlocked: boolean;
}

export interface ExtendedStats {
	averageAttempts: number;
	totalHintsUsed: number;
	perfectGames: number;
	fastestSolve: number | null;
	longestStreak: number;
	gamesPerLevel: { [level: number]: number };
	achievements: Achievement[];
}

export interface GameStats {
	points: number;
	streak: number;
	totalGames: number;
	wins: number;
	level: number;
	lastPlayDate: string | null;
	extended: ExtendedStats;
}

export const ACHIEVEMENTS: Achievement[] = [
	{
		id: "first_win",
		title: "First Victory",
		description: "Win your first game",
		icon: "trophy",
		requirement: 1,
		progress: 0,
		unlocked: false,
	},
	{
		id: "streak_3",
		title: "Hot Streak",
		description: "Win 3 games in a row",
		icon: "flame",
		requirement: 3,
		progress: 0,
		unlocked: false,
	},
	{
		id: "no_hints",
		title: "Pure Genius",
		description: "Win without using any hints",
		icon: "bulb",
		requirement: 1,
		progress: 0,
		unlocked: false,
	},
	{
		id: "perfect_game",
		title: "Perfect Game",
		description: "Win on your first attempt",
		icon: "star",
		requirement: 1,
		progress: 0,
		unlocked: false,
	},
	{
		id: "level_5",
		title: "Rising Star",
		description: "Reach level 5",
		icon: "rocket",
		requirement: 5,
		progress: 0,
		unlocked: false,
	},
];

export const MAX_ATTEMPTS = 6;

export async function checkGuess(guess: string, answer: string): Promise<{ correct: boolean }> {
	const normalizedGuess = guess.toLowerCase().trim();
	const normalizedAnswer = answer.toLowerCase().replace(/[^a-zA-Z]/g, "");
	return { correct: normalizedGuess === normalizedAnswer };
}

export async function saveGameState(state: GameState): Promise<void> {
	try {
		await AsyncStorage.setItem("gameState", JSON.stringify(state));
	} catch (error) {
		console.error("Error saving game state:", error);
	}
}

export async function loadGameState(): Promise<GameState | null> {
	try {
		const state = await AsyncStorage.getItem("gameState");
		return state ? JSON.parse(state) : null;
	} catch (error) {
		console.error("Error loading game state:", error);
		return null;
	}
}

export async function saveGameStats(stats: GameStats): Promise<void> {
	try {
		await AsyncStorage.setItem("gameStats", JSON.stringify(stats));
	} catch (error) {
		console.error("Error saving game stats:", error);
	}
}

export async function loadGameStats(): Promise<GameStats> {
	try {
		const stats = await AsyncStorage.getItem("gameStats");
		const defaultStats: GameStats = {
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
				achievements: [...ACHIEVEMENTS],
			},
		};
		return stats ? JSON.parse(stats) : defaultStats;
	} catch (error) {
		console.error("Error loading game stats:", error);
		return {
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
				achievements: [...ACHIEVEMENTS],
			},
		};
	}
}

export function calculatePoints(success: boolean, streak: number): number {
	if (!success) return 0;

	const basePoints = 100;
	const streakBonus = Math.min(streak * 10, 50);
	return basePoints + streakBonus;
}

export function getLevel(points: number): { level: number; nextLevelPoints: number } {
	const level = Math.floor(points / 1000) + 1;
	const nextLevelPoints = level * 1000;
	return { level, nextLevelPoints };
}

export function calculateHintPenalty(usedHints: number[]): number {
	return usedHints.length * 0.25;
}

export const DAILY_PUZZLES: GameData[] = [
	{
		id: "1",
		rebusPuzzle: "T + 🌳",
		answer: "TREE",
		hints: ["It grows from the ground", "Has leaves", "Provides shade"],
	},
	{
		id: "2",
		rebusPuzzle: "🌞 + 👓",
		answer: "SUNGLASSES",
		hints: ["Protects your eyes", "Worn on sunny days", "Fashion accessory"],
	},
	{
		id: "3",
		rebusPuzzle: "🌙 + 💡",
		answer: "NIGHTLIGHT",
		hints: ["Helps you see in the dark", "Common in children's rooms", "Soft glow"],
	},
	{
		id: "4",
		rebusPuzzle: "🌊 + 🏄",
		answer: "SURFING",
		hints: ["Ocean sport", "Riding waves", "Board required"],
	},
	{
		id: "5",
		rebusPuzzle: "☕️ + ⏰",
		answer: "MORNING",
		hints: ["Start of the day", "When people wake up", "Sunrise time"],
	},
];

export async function getDailyPuzzle(): Promise<GameData> {
	try {
		const lastPlayDate = await AsyncStorage.getItem("lastPlayDate");
		const currentDate = new Date().toISOString().split("T")[0];

		// If it's a new day or first time playing
		if (!lastPlayDate || lastPlayDate !== currentDate) {
			await AsyncStorage.setItem("lastPlayDate", currentDate);

			// Get a deterministic puzzle based on the date
			const dateNum = parseInt(currentDate.replace(/-/g, ""));
			const puzzleIndex = dateNum % DAILY_PUZZLES.length;
			return DAILY_PUZZLES[puzzleIndex];
		}

		// If same day, get the stored puzzle
		const storedPuzzle = await AsyncStorage.getItem("currentPuzzle");
		if (storedPuzzle) {
			return JSON.parse(storedPuzzle);
		}

		// Fallback to first puzzle
		return DAILY_PUZZLES[0];
	} catch (error) {
		console.error("Error getting daily puzzle:", error);
		return DAILY_PUZZLES[0];
	}
}

export async function saveDailyPuzzle(puzzle: GameData): Promise<void> {
	try {
		await AsyncStorage.setItem("currentPuzzle", JSON.stringify(puzzle));
	} catch (error) {
		console.error("Error saving daily puzzle:", error);
	}
}

export function updateAchievements(stats: GameStats, gameState: GameState, solveTime?: number): Achievement[] {
	const achievements = [...stats.extended.achievements];

	// First Win
	if (gameState.wasSuccessful && !achievements.find((a) => a.id === "first_win")?.unlocked) {
		const achievement = achievements.find((a) => a.id === "first_win")!;
		achievement.progress = 1;
		achievement.unlocked = true;
	}

	// Hot Streak
	const streakAchievement = achievements.find((a) => a.id === "streak_3")!;
	streakAchievement.progress = stats.streak;
	if (stats.streak >= 3) {
		streakAchievement.unlocked = true;
	}

	// No Hints
	if (gameState.wasSuccessful && gameState.usedHints.length === 0) {
		const achievement = achievements.find((a) => a.id === "no_hints")!;
		achievement.progress = 1;
		achievement.unlocked = true;
	}

	// Perfect Game
	if (gameState.wasSuccessful && gameState.attemptsLeft === MAX_ATTEMPTS - 1) {
		const achievement = achievements.find((a) => a.id === "perfect_game")!;
		achievement.progress = 1;
		achievement.unlocked = true;
	}

	// Level 5
	const levelAchievement = achievements.find((a) => a.id === "level_5")!;
	levelAchievement.progress = stats.level;
	if (stats.level >= 5) {
		levelAchievement.unlocked = true;
	}

	return achievements;
}

export function updateExtendedStats(currentStats: GameStats, gameState: GameState, solveTime?: number): ExtendedStats {
	const attemptsUsed = MAX_ATTEMPTS - gameState.attemptsLeft;
	const totalAttempts = currentStats.totalGames * currentStats.extended.averageAttempts + attemptsUsed;
	const newAverage = totalAttempts / (currentStats.totalGames + 1);

	const newStats: ExtendedStats = {
		...currentStats.extended,
		averageAttempts: Number(newAverage.toFixed(2)),
		totalHintsUsed: currentStats.extended.totalHintsUsed + gameState.usedHints.length,
		perfectGames: currentStats.extended.perfectGames + (gameState.wasSuccessful && attemptsUsed === 1 ? 1 : 0),
		fastestSolve: solveTime ? (currentStats.extended.fastestSolve ? Math.min(currentStats.extended.fastestSolve, solveTime) : solveTime) : currentStats.extended.fastestSolve,
		longestStreak: Math.max(currentStats.extended.longestStreak, currentStats.streak),
		gamesPerLevel: {
			...currentStats.extended.gamesPerLevel,
			[currentStats.level]: (currentStats.extended.gamesPerLevel[currentStats.level] || 0) + 1,
		},
		achievements: updateAchievements(currentStats, gameState, solveTime),
	};

	return newStats;
}
