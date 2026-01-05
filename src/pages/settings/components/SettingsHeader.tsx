import type { Accessor, Setter } from "solid-js";
import { For } from "solid-js";

import type { SettingsTab } from "../types";

export interface SettingsHeaderProps {
	appVersion: Accessor<string>;
	saving: Accessor<boolean>;
	tabs: { id: SettingsTab; label: string }[];
	activeTab: Accessor<SettingsTab>;
	setActiveTab: Setter<SettingsTab>;
}

export function SettingsHeader(props: SettingsHeaderProps) {
	const { appVersion, saving, tabs, activeTab, setActiveTab } = props;
	let tabRefs: HTMLButtonElement[] = [];

	const focusTabAtIndex = (index: number) => {
		queueMicrotask(() => tabRefs[index]?.focus());
	};

	const moveFocus = (currentIndex: number, delta: number) => {
		const nextIndex =
			(currentIndex + delta + tabs.length) % Math.max(1, tabs.length);
		const nextTab = tabs[nextIndex];
		if (!nextTab) return;
		setActiveTab(nextTab.id);
		focusTabAtIndex(nextIndex);
	};

	return (
		<header class="sticky top-0 z-10 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200/70 dark:border-gray-800/70 bg-white/75 dark:bg-gray-900/55 backdrop-blur">
			<div class="flex items-center justify-between gap-2 sm:gap-3 max-w-6xl mx-auto">
				<div class="flex items-center gap-2 sm:gap-3">
					<h1 class="font-bold text-lg text-gray-900 dark:text-gray-100">
						Settings
					</h1>
					<span class="text-xs text-gray-400">v{appVersion()}</span>
					{saving() && (
						<span class="text-xs text-gray-400 ml-2 flex items-center gap-1">
							<svg
								class="w-3 h-3 animate-spin"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								/>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								/>
							</svg>
							Saving
						</span>
					)}
				</div>

				{/* Tab Navigation */}
				<div
					class="flex gap-1 overflow-x-auto -mx-1 px-1 py-1 lg:hidden"
					role="tablist"
					aria-label="Settings sections"
					aria-orientation="horizontal"
				>
					<For each={tabs}>
						{(tab, index) => (
							<button
								type="button"
								id={`settings-tab-${tab.id}`}
								role="tab"
								aria-selected={activeTab() === tab.id}
								aria-controls={`settings-panel-${tab.id}`}
								tabIndex={activeTab() === tab.id ? 0 : -1}
								ref={(el) => {
									tabRefs[index()] = el;
								}}
								onClick={() => setActiveTab(tab.id)}
								onKeyDown={(event) => {
									if (event.key === "ArrowLeft") {
										event.preventDefault();
										moveFocus(index(), -1);
										return;
									}
									if (event.key === "ArrowRight") {
										event.preventDefault();
										moveFocus(index(), 1);
										return;
									}
									if (event.key === "Home") {
										event.preventDefault();
										setActiveTab(tabs[0]!.id);
										focusTabAtIndex(0);
										return;
									}
									if (event.key === "End") {
										event.preventDefault();
										const lastIndex = tabs.length - 1;
										setActiveTab(tabs[lastIndex]!.id);
										focusTabAtIndex(lastIndex);
									}
								}}
								class="px-3 py-1.5 text-sm font-medium rounded-xl transition-all whitespace-nowrap flex-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
								classList={{
									"bg-brand-100/80 dark:bg-brand-900/25 text-brand-700 dark:text-brand-300 shadow-sm":
										activeTab() === tab.id,
									"text-gray-600 dark:text-gray-400 hover:bg-gray-100/80 dark:hover:bg-gray-800/60 hover:shadow-sm":
										activeTab() !== tab.id,
								}}
							>
								{tab.label}
							</button>
						)}
					</For>
				</div>
			</div>
		</header>
	);
}

