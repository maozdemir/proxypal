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

	return (
		<nav class="hidden lg:flex lg:flex-col gap-1 self-start sticky top-24">
			<For each={tabs}>
				{(tab) => (
					<button
						type="button"
						onClick={() => setActiveTab(tab.id)}
						class="px-3 py-2 text-sm font-medium rounded-xl transition-all text-left w-full"
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

