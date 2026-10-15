export const sectionLabels = ["Packages", "Coverage", "Support", "Contact", "Sales"] as const;
export const websiteSections = new Set(sectionLabels.map(label => label.toLowerCase()));