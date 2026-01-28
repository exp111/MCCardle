import {CardData, CardFaction, CardType, Pack} from '../model/cardData';
import {MARVELCDB_CARD_URL, MARVELCDB_IMAGE_URL} from './const';

export function getCardImage(card: CardData) {
  return `${MARVELCDB_IMAGE_URL}${card.code}.png`;
}

export function getCardMarvelCDBURL(card: CardData) {
  return `${MARVELCDB_CARD_URL}${card.code}`;
}

export function getEnumKey(enums: any, val: string) {
  return Object.entries(enums).find(([_, v]) => v === val)![0] ?? val;
}

export function getType(type: CardType) {
  return getEnumKey(CardType, type);
}

export function getFaction(faction: CardFaction) {
  return getEnumKey(CardFaction, faction);
}

export function getPack(pack: string) {
  return getEnumKey(Pack, pack)
    .replaceAll(/([A-Z])/g, (c) => ` ${c}`) // convert camel case to spaces
    .replace("S H I E L D", "S.H.I.E.L.D."); // edge case
}

export function camelCaseToSpaces(str: string) {
  return str.replaceAll(/([A-Z])/g, (c) => ` ${c}`);
}

//export function getSet(set: string) {
//  return set.replace(/^\w/, (c) => c.toUpperCase()).replaceAll(/_(\w)/g, (c) => ` ${c[1].toUpperCase()}`) // convert to camel case
//}

export function getCardName(card: CardData, translated: boolean) {
  return translated ? card.name_de ?? card.name : card.name;
}
