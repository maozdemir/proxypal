import type { Accessor, Setter } from "solid-js";
import { For } from "solid-js";

import type { SettingsTab } from "../types";

export interface SettingsSidebarNavProps {
	tabs: { id: SettingsTab; label: string }[];
	activeTab: Accessor<SettingsTab>;
	setActiveTab: Setter<SettingsTab>;
}

export function SettingsSidebarNav(props: SettingsSidebarNavProps) {
	const { tabs, activeTab, setActiveTab } = props;
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
		<nav
			class="hidden lg:flex lg:flex-col gap-1 self-start sticky top-24"
			role="tablist"
			aria-label="Settings sections"
			aria-orientation="vertical"
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
							if (event.key === "ArrowUp") {
								event.preventDefault();
								moveFocus(index(), -1);
								return;
							}
							if (event.key === "ArrowDown") {
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
						class="px-3 py-2 text-sm font-medium rounded-xl transition-all text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
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
		</nav>
	);
}

