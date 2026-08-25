import {
  Candy,
  ChefHat,
  CookingPot,
  GraduationCap,
  Package,
  Sandwich,
  Soup,
  Wheat,
  type LucideIcon,
} from "lucide-react";

/**
 * Category.icon is a plain string key in the database, not a component —
 * this is the one place that turns it into something renderable, so
 * swapping icon libraries later never touches seed data.
 */
export const dabbaIcons: Record<string, LucideIcon> = {
  soup: Soup,
  "cooking-pot": CookingPot,
  sandwich: Sandwich,
  wheat: Wheat,
  candy: Candy,
  package: Package,
  "graduation-cap": GraduationCap,
};

export function getDabbaIcon(key: string): LucideIcon {
  return dabbaIcons[key] ?? ChefHat;
}
