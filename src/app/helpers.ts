import {CardData, CardFaction, CardType, Pack} from '../model/cardData';
import {GITHUB_PAGES_URL, MARVELCDB_BASE_URL, MARVELCDB_CARD_URL, PLACEHOLDER_IMAGE} from './const';
import {NgbDate} from '@ng-bootstrap/ng-bootstrap';
import Rand from 'rand-seed';

export function getCardImage(card: CardData) {
  return card.img ? `${MARVELCDB_BASE_URL}${card.img}` : PLACEHOLDER_IMAGE;
}

export function getCardMarvelCDBURL(card: CardData) {
  return `${MARVELCDB_CARD_URL}/${card.code}`;
}

export function getEnumKey(enums: any, val: string) {
  return Object.entries(enums).find(([_, v]) => v === val)?.[0] ?? val;
}

export function getType(type: CardType) {
  return getEnumKey(CardType, type)
    .replaceAll(/([A-Z])/g, (c) => ` ${c}`); // convert camel case to spaces
}

export function getFaction(faction: CardFaction) {
  return getEnumKey(CardFaction, faction);
}

export function getPack(pack: string) {
  return getEnumKey(Pack, pack)
    .replaceAll(/([A-Z])/g, (c) => ` ${c}`) // convert camel case to spaces
    .replaceAll("S H I E L D", "S.H.I.E.L.D.") // edge cases
    .replaceAll("S Pdr", "SP//dr");
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

export function getShareLink(day: string, card: CardData, guesses: CardData[], german?: boolean) {
  return `${GITHUB_PAGES_URL}#/viewer?day=${day}&code=${card.code}&guesses=${guesses.map(g => g.code).join(',')}${german ? `&german=${german}` : ''}`;
}

export function sortString(str: string, compareFn?: (a: string, b: string) => number) {
  return str.split("").sort(compareFn).join("");
}

export function arraysHaveSameValues<T>(a: T[], b: T[]) {
  if (a.length !== b.length) {
    return false;
  }

  const sortedA = [...a].sort();
  const sortedB = [...b].sort();

  return sortedA.every((value, index) => value === sortedB[index]);
}

export function mapRecordValues<K extends string, V, R>(
  record: Record<K, V>,
  mapper: (value: V, key: K) => R
): Record<K, R> {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key,
      mapper(value as V, key as K),
    ])
  ) as Record<K, R>
}

export function ngbDateToISOString(date: NgbDate) {
  return `${date.year}-${date.month.toString().padStart(2, "0")}-${date.day.toString().padStart(2, "0")}`
}

export function getRandomItem(arr: any[], seed?: string) {
  let random = new Rand(seed);
  let index = Math.floor(random.next() * arr.length);
  return arr[index];
}

const minRandomDate = new Date(2000, 0, 1);
const maxRandomDate = new Date();
const minRandomDateTime = minRandomDate.getTime();
const maxRandomDateTime = maxRandomDate.getTime();

export function getRandomDate() {
  return new Date(minRandomDateTime + Math.random() * (maxRandomDateTime - minRandomDateTime),);
}

export function dateToNgbDate(date: Date) {
  return new NgbDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}
