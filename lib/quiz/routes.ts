/** Unit ids carry a dot ("4.2"); URLs carry a dash. */
export const unitSlug = (unitId: string): string => unitId.replace(".", "-");

export const unitIdFromSlug = (slug: string): string => slug.replace("-", ".");
