import { createEffect, createSignal } from "solid-js";

import {
	getClaudeCodeSettings,
	setClaudeCodeFallbacks,
	setClaudeCodeModel,
} from "../../../lib/tauri";
import type { ClaudeCodeSettings } from "../../../lib/tauri";
import { toastStore } from "../../../stores/toast";

export function createClaudeCodeSettings() {
	const [claudeCodeSettings, setClaudeCodeSettings] =
		createSignal<ClaudeCodeSettings>({
			haikuModel: null,
			opusModel: null,
			sonnetModel: null,
			haikuFallback: [],
			sonnetFallback: [],
			opusFallback: [],
			baseUrl: null,
			authToken: null,
		});

	createEffect(async () => {
		try {
			const settings = await getClaudeCodeSettings();
			setClaudeCodeSettings(settings);
		} catch (error) {
			console.error("Failed to fetch Claude Code settings:", error);
		}
	});

	const handleClaudeCodeSettingChange = async (
		modelType: "haikuModel" | "opusModel" | "sonnetModel",
		modelName: string,
	) => {
		try {
			const backendModelType = modelType.replace("Model", "") as
				| "haiku"
				| "opus"
				| "sonnet";
			await setClaudeCodeModel(backendModelType, modelName);
			setClaudeCodeSettings((prev) => ({
				...prev,
				[modelType]: modelName || null,
			}));
			toastStore.success("Claude Code model updated");
		} catch (error) {
			console.error("Failed to save Claude Code setting:", error);
			toastStore.error(`Failed to save setting: ${error}`);
		}
	};

	const handleClaudeCodeFallbackChange = async (
		slot: "haiku" | "opus" | "sonnet",
		models: string[],
	) => {
		try {
			await setClaudeCodeFallbacks(slot, models);
			setClaudeCodeSettings((prev) => ({
				...prev,
				[`${slot}Fallback`]: models,
			}));
			toastStore.success("Claude Code fallbacks updated");
		} catch (error) {
			console.error("Failed to save Claude Code fallbacks:", error);
			toastStore.error(`Failed to save fallbacks: ${error}`);
		}
	};

	return {
		claudeCodeSettings,
		handleClaudeCodeSettingChange,
		handleClaudeCodeFallbackChange,
	};
}

