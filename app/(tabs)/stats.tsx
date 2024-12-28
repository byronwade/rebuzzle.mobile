import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { SafeAreaView } from "react-native-safe-area-context";
import { GameStats, loadGameStats } from "@/lib/gameLogic";
import { Ionicons } from "@expo/vector-icons";

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
	return (
		<View style={styles.statCard}>
			<View style={styles.statIcon}>
				<Ionicons name={icon as any} size={20} color="#8B5CF6" />
			</View>
			<View style={styles.statContent}>
				<ThemedText style={styles.statValue}>{value}</ThemedText>
				<ThemedText style={styles.statTitle}>{title}</ThemedText>
			</View>
		</View>
	);
}

function AchievementCard({ achievement }: { achievement: { title: string; description: string; icon: string; progress: number; requirement: number; unlocked: boolean } }) {
	return (
		<View style={[styles.achievementCard, achievement.unlocked && styles.unlockedCard]}>
			<View style={[styles.achievementIcon, achievement.unlocked && styles.unlockedIcon]}>
				<Ionicons name={achievement.icon as any} size={24} color={achievement.unlocked ? "#FFFFFF" : "#9CA3AF"} />
			</View>
			<View style={styles.achievementContent}>
				<View style={styles.achievementHeader}>
					<ThemedText style={[styles.achievementTitle, achievement.unlocked && styles.unlockedText]}>{achievement.title}</ThemedText>
					{achievement.unlocked && (
						<View style={styles.unlockedBadge}>
							<Ionicons name="checkmark-circle" size={16} color="#22C55E" />
							<ThemedText style={styles.unlockedBadgeText}>Unlocked</ThemedText>
						</View>
					)}
				</View>
				<ThemedText style={styles.achievementDescription}>{achievement.description}</ThemedText>
				<View style={styles.progressContainer}>
					<View style={styles.progressBar}>
						<View style={[styles.progressFill, { width: `${(achievement.progress / achievement.requirement) * 100}%` }, achievement.unlocked && styles.unlockedProgressFill]} />
					</View>
					<ThemedText style={styles.progressText}>
						{achievement.progress} / {achievement.requirement}
					</ThemedText>
				</View>
			</View>
		</View>
	);
}

export default function StatsScreen() {
	const [stats, setStats] = useState<GameStats | null>(null);
	const [activeTab, setActiveTab] = useState<"stats" | "achievements">("stats");

	useEffect(() => {
		loadGameStats().then(setStats);
	}, []);

	if (!stats) return null;

	const formatTime = (ms: number) => {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		return `${minutes}m ${seconds % 60}s`;
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<ThemedView style={styles.container}>
				<View style={styles.tabs}>
					<TouchableOpacity style={[styles.tab, activeTab === "stats" && styles.activeTab]} onPress={() => setActiveTab("stats")}>
						<ThemedText style={[styles.tabText, activeTab === "stats" && styles.activeTabText]}>Statistics</ThemedText>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.tab, activeTab === "achievements" && styles.activeTab]} onPress={() => setActiveTab("achievements")}>
						<ThemedText style={[styles.tabText, activeTab === "achievements" && styles.activeTabText]}>Achievements</ThemedText>
					</TouchableOpacity>
				</View>

				<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
					{activeTab === "stats" ? (
						<View style={styles.statsGrid}>
							<StatCard title="Games Played" value={stats.totalGames} icon="game-controller" />
							<StatCard title="Win Rate" value={`${((stats.wins / stats.totalGames) * 100 || 0).toFixed(1)}%`} icon="trophy" />
							<StatCard title="Current Streak" value={stats.streak} icon="flame" />
							<StatCard title="Longest Streak" value={stats.extended.longestStreak} icon="trending-up" />
							<StatCard title="Average Attempts" value={stats.extended.averageAttempts.toFixed(1)} icon="analytics" />
							<StatCard title="Perfect Games" value={stats.extended.perfectGames} icon="star" />
							<StatCard title="Total Hints Used" value={stats.extended.totalHintsUsed} icon="bulb" />
							{stats.extended.fastestSolve && <StatCard title="Fastest Solve" value={formatTime(stats.extended.fastestSolve)} icon="timer" />}
						</View>
					) : (
						<View style={styles.achievementsContainer}>
							{stats.extended.achievements.map((achievement) => (
								<AchievementCard key={achievement.id} achievement={achievement} />
							))}
						</View>
					)}
				</ScrollView>
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
	},
	tabs: {
		flexDirection: "row",
		marginBottom: 24,
		backgroundColor: "#F3F4F6",
		borderRadius: 16,
		padding: 4,
	},
	tab: {
		flex: 1,
		paddingVertical: 12,
		alignItems: "center",
		borderRadius: 12,
	},
	activeTab: {
		backgroundColor: "#FFFFFF",
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
	tabText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#6B7280",
	},
	activeTabText: {
		color: "#1F2937",
	},
	content: {
		flex: 1,
	},
	statsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 16,
		padding: 4,
	},
	statCard: {
		width: "47%",
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 16,
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
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
	statIcon: {
		width: 40,
		height: 40,
		borderRadius: 12,
		backgroundColor: "#F3F4F6",
		alignItems: "center",
		justifyContent: "center",
	},
	statContent: {
		flex: 1,
	},
	statTitle: {
		fontSize: 14,
		color: "#6B7280",
	},
	statValue: {
		fontSize: 24,
		fontWeight: "700",
		color: "#1F2937",
		marginBottom: 2,
	},
	achievementsContainer: {
		gap: 16,
		padding: 4,
	},
	achievementCard: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 16,
		flexDirection: "row",
		gap: 16,
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
	unlockedCard: {
		backgroundColor: "#F0FDF4",
	},
	achievementIcon: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: "#F3F4F6",
		alignItems: "center",
		justifyContent: "center",
	},
	unlockedIcon: {
		backgroundColor: "#22C55E",
	},
	achievementContent: {
		flex: 1,
		gap: 8,
	},
	achievementHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	achievementTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#1F2937",
	},
	unlockedText: {
		color: "#16A34A",
	},
	unlockedBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		backgroundColor: "#DCFCE7",
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 20,
	},
	unlockedBadgeText: {
		fontSize: 12,
		fontWeight: "600",
		color: "#16A34A",
	},
	achievementDescription: {
		fontSize: 14,
		color: "#6B7280",
		lineHeight: 20,
	},
	progressContainer: {
		gap: 6,
	},
	progressBar: {
		height: 6,
		backgroundColor: "#F3F4F6",
		borderRadius: 3,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		backgroundColor: "#8B5CF6",
		borderRadius: 3,
	},
	unlockedProgressFill: {
		backgroundColor: "#22C55E",
	},
	progressText: {
		fontSize: 12,
		color: "#6B7280",
		fontWeight: "500",
	},
});
