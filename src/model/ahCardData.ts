import {CardData} from './cardData';

export interface AhCardData extends CardData {
  cost?: number;
  type: AhCardType;
  faction: AhCardFaction;
  name: string;
  name_de?: string;
  year: number;
  skills: AhCardSkill[];
  traits: string[];
  packs: AhPack[];
  img: string;
  xp: number;
  illustrators: string[];
}

export type AhCardDataArrayField = "skills" | "packs" | "traits";

export enum AhCardType {
  Event = "event",
  Asset = "asset",
  Skill = "skill"
}

export enum AhCardFaction {
  Mystic = "mystic",
  Survivor = "survivor",
  Neutral = "neutral",
  Guardian = "guardian",
  Seeker = "seeker",
  Rogue = "rogue",

  // shouldnt be in data
  Mythos = "mythos"
}

export enum AhCardSkill {
  Willpower = "p",
  Intellect = "b",
  Combat = "c",
  Agility = "a",
  Wild = "?"
}

export enum AhPack {
  Core = "core",
}
