import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { Gamepad2, BarChart2 } from "lucide-react-native";

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: "#FFFFFF",
					borderTopWidth: 0,
					elevation: 0,
					height: Platform.OS === "ios" ? 90 : 70,
					paddingBottom: Platform.OS === "ios" ? 30 : 16,
					paddingTop: 12,
					shadowColor: "#000",
					shadowOffset: {
						width: 0,
						height: -2,
					},
					shadowOpacity: 0.05,
					shadowRadius: 8,
				},
				tabBarActiveTintColor: "#8B5CF6",
				tabBarInactiveTintColor: "#9CA3AF",
				tabBarLabelStyle: {
					fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
					fontSize: 12,
					fontWeight: "500",
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Game",
					tabBarIcon: ({ color, size }) => <Gamepad2 size={size} color={color} strokeWidth={2} />,
				}}
			/>
			<Tabs.Screen
				name="stats"
				options={{
					title: "Stats",
					tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} strokeWidth={2} />,
				}}
			/>
		</Tabs>
	);
}
