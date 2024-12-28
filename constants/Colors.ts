/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#0891B2";
const tintColorDark = "#06B6D4";

export const Colors = {
	light: {
		text: "#1F2937",
		background: "#FFFFFF",
		tint: tintColorLight,
		tabIconDefault: "#6B7280",
		tabIconSelected: tintColorLight,
		icon: "#4B5563",
	},
	dark: {
		text: "#F9FAFB",
		background: "#111827",
		tint: tintColorDark,
		tabIconDefault: "#9CA3AF",
		tabIconSelected: tintColorDark,
		icon: "#D1D5DB",
	},
} as const;
