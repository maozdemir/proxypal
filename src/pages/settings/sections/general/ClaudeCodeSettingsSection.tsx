import type { Accessor } from "solid-js";
import { For, Show } from "solid-js";

import type { ClaudeCodeSettings } from "../../../../lib/tauri";
import type { SettingsTab } from "../../types";

type ModelOption = { value: string; label: string };
type AvailableTargetModels = {
	customModels: ModelOption[];
	builtInModels: {
		anthropic: ModelOption[];
		google: ModelOption[];
		openai: ModelOption[];
		copilot: ModelOption[];
		qwen: ModelOption[];
		iflow: ModelOption[];
	};
};

export interface ClaudeCodeSettingsSectionProps {
	activeTab: Accessor<SettingsTab>;
	claudeCodeSettings: Accessor<ClaudeCodeSettings>;
	getAvailableTargetModels: () => AvailableTargetModels;
	handleClaudeCodeSettingChange: (
		modelType: "haikuModel" | "opusModel" | "sonnetModel",
		modelName: string,
	) => void | Promise<void>;
	handleClaudeCodeFallbackChange: (
		slot: "haiku" | "opus" | "sonnet",
		models: string[],
	) => void | Promise<void>;
}

export function ClaudeCodeSettingsSection(props: ClaudeCodeSettingsSectionProps) {
	const {
		activeTab,
		claudeCodeSettings,
		getAvailableTargetModels,
		handleClaudeCodeSettingChange,
		handleClaudeCodeFallbackChange,
	} = props;

	return (
		<div class="space-y-4" classList={{ hidden: activeTab() !== "general" }}>
			<h2 class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
				Claude Code Settings
			</h2>

			<div class="space-y-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
				<p class="text-xs text-gray-500 dark:text-gray-400">
					Map Claude Code model slots to available provider models. These
					settings modify the claude_desktop_config.json file.
				</p>

				<div class="space-y-3">
					{(() => {
						const { customModels, builtInModels } = getAvailableTargetModels();
						const hasModels =
							customModels.length > 0 ||
							builtInModels.anthropic.length > 0 ||
							builtInModels.google.length > 0 ||
							builtInModels.openai.length > 0 ||
							builtInModels.copilot.length > 0;

						if (!hasModels) {
							return (
								<p class="text-sm text-gray-500 dark:text-gray-400 italic">
									No models available. Please authenticate with a provider first.
								</p>
							);
						}

						const renderModelOptions = (options: AvailableTargetModels) => (
							<>
								<Show when={options.customModels.length > 0}>
									<optgroup label="Custom Providers">
										<For each={options.customModels}>
											{(model) => (
												<option value={model.value}>{model.label}</option>
											)}
										</For>
									</optgroup>
								</Show>
								<Show when={options.builtInModels.anthropic.length > 0}>
									<optgroup label="Anthropic">
										<For each={options.builtInModels.anthropic}>
											{(model) => (
												<option value={model.value}>{model.label}</option>
											)}
										</For>
									</optgroup>
								</Show>
								<Show when={options.builtInModels.google.length > 0}>
									<optgroup label="Google">
										<For each={options.builtInModels.google}>
											{(model) => (
												<option value={model.value}>{model.label}</option>
											)}
										</For>
									</optgroup>
								</Show>
								<Show when={options.builtInModels.openai.length > 0}>
									<optgroup label="OpenAI">
										<For each={options.builtInModels.openai}>
											{(model) => (
												<option value={model.value}>{model.label}</option>
											)}
										</For>
									</optgroup>
								</Show>
								<Show when={options.builtInModels.copilot.length > 0}>
									<optgroup label="GitHub Copilot">
										<For each={options.builtInModels.copilot}>
											{(model) => (
												<option value={model.value}>{model.label}</option>
											)}
										</For>
									</optgroup>
								</Show>
								<Show when={options.builtInModels.qwen.length > 0}>
									<optgroup label="Qwen">
										<For each={options.builtInModels.qwen}>
											{(model) => (
												<option value={model.value}>{model.label}</option>
											)}
										</For>
									</optgroup>
								</Show>
								<Show when={options.builtInModels.iflow.length > 0}>
									<optgroup label="iFlow">
										<For each={options.builtInModels.iflow}>
											{(model) => (
												<option value={model.value}>{model.label}</option>
											)}
										</For>
									</optgroup>
								</Show>
							</>
						);

						const ModelSelect = (localProps: {
							label: string;
							value: string | null;
							modelType: "haikuModel" | "opusModel" | "sonnetModel";
							fallback: string[];
							slot: "haiku" | "opus" | "sonnet";
						}) => {
							const filteredOptions = () => {
								const excluded = new Set([
									...(localProps.value ? [localProps.value] : []),
									...localProps.fallback,
								]);
								return {
									customModels: customModels.filter(
										(model) => !excluded.has(model.value),
									),
									builtInModels: {
										anthropic: builtInModels.anthropic.filter(
											(model) => !excluded.has(model.value),
										),
										google: builtInModels.google.filter(
											(model) => !excluded.has(model.value),
										),
										openai: builtInModels.openai.filter(
											(model) => !excluded.has(model.value),
										),
										copilot: builtInModels.copilot.filter(
											(model) => !excluded.has(model.value),
										),
										qwen: builtInModels.qwen.filter(
											(model) => !excluded.has(model.value),
										),
										iflow: builtInModels.iflow.filter(
											(model) => !excluded.has(model.value),
										),
									},
								};
							};

							const moveFallback = (index: number, direction: -1 | 1) => {
								const nextIndex = index + direction;
								if (nextIndex < 0 || nextIndex >= localProps.fallback.length) {
									return;
								}
								const updated = [...localProps.fallback];
								const [item] = updated.splice(index, 1);
								updated.splice(nextIndex, 0, item);
								handleClaudeCodeFallbackChange(localProps.slot, updated);
							};

							const removeFallback = (index: number) => {
								const updated = localProps.fallback.filter((_, i) => i !== index);
								handleClaudeCodeFallbackChange(localProps.slot, updated);
							};

							const addFallback = (modelId: string) => {
								if (!modelId) {
									return;
								}
								const updated = [...localProps.fallback, modelId];
								handleClaudeCodeFallbackChange(localProps.slot, updated);
							};

							const fallbackOptions = filteredOptions();

							return (
								<div class="space-y-2">
									<label class="block">
										<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
											{localProps.label}
										</span>
										<select
											value={localProps.value || ""}
											onChange={(e) =>
												handleClaudeCodeSettingChange(
													localProps.modelType,
													e.currentTarget.value,
												)
											}
											class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-smooth [&>option]:bg-white [&>option]:dark:bg-gray-900 [&>option]:text-gray-900 [&>option]:dark:text-gray-100 [&>optgroup]:bg-white [&>optgroup]:dark:bg-gray-900 [&>optgroup]:text-gray-900 [&>optgroup]:dark:text-gray-100"
										>
											<option value="">Select model...</option>
											{renderModelOptions({ customModels, builtInModels })}
										</select>
									</label>

									<div>
										<div class="flex items-center justify-between">
											<span class="text-xs font-medium text-gray-500 dark:text-gray-400">
												Fallback order
											</span>
											<span class="text-[11px] text-gray-400 dark:text-gray-500">
												429/5xx/timeout retries
											</span>
										</div>
										<div class="mt-1 space-y-2">
											<Show when={localProps.fallback.length === 0}>
												<p class="text-xs text-gray-500 dark:text-gray-400 italic">
													No fallbacks configured.
												</p>
											</Show>
											<For each={localProps.fallback}>
												{(model, index) => (
													<div class="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1">
														<span class="text-xs text-gray-700 dark:text-gray-300 truncate">
															{model}
														</span>
														<div class="ml-auto flex items-center gap-1">
															<button
																type="button"
																class="px-2 py-0.5 text-[11px] rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
																disabled={index() === 0}
																onClick={() => moveFallback(index(), -1)}
															>
																Up
															</button>
															<button
																type="button"
																class="px-2 py-0.5 text-[11px] rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
																disabled={index() === localProps.fallback.length - 1}
																onClick={() => moveFallback(index(), 1)}
															>
																Down
															</button>
															<button
																type="button"
																class="px-2 py-0.5 text-[11px] rounded-md border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/40"
																onClick={() => removeFallback(index())}
															>
																Remove
															</button>
														</div>
													</div>
												)}
											</For>
										</div>
									</div>

									<div>
										<label class="block text-xs font-medium text-gray-700 dark:text-gray-300">
											Add fallback
										</label>
										<select
											value=""
											onChange={(e) => {
												addFallback(e.currentTarget.value);
												e.currentTarget.value = "";
											}}
											class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-smooth [&>option]:bg-white [&>option]:dark:bg-gray-900 [&>option]:text-gray-900 [&>option]:dark:text-gray-100 [&>optgroup]:bg-white [&>optgroup]:dark:bg-gray-900 [&>optgroup]:text-gray-900 [&>optgroup]:dark:text-gray-100"
										>
											<option value="">Select model...</option>
											{renderModelOptions(fallbackOptions)}
										</select>
									</div>
								</div>
							);
						};

						return (
							<>
								<ModelSelect
									label="Haiku Model"
									value={claudeCodeSettings().haikuModel}
									modelType="haikuModel"
									fallback={claudeCodeSettings().haikuFallback}
									slot="haiku"
								/>
								<ModelSelect
									label="Sonnet Model"
									value={claudeCodeSettings().sonnetModel}
									modelType="sonnetModel"
									fallback={claudeCodeSettings().sonnetFallback}
									slot="sonnet"
								/>
								<ModelSelect
									label="Opus Model"
									value={claudeCodeSettings().opusModel}
									modelType="opusModel"
									fallback={claudeCodeSettings().opusFallback}
									slot="opus"
								/>
							</>
						);
					})()}
				</div>
			</div>
		</div>
	);
}
