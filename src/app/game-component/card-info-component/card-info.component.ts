import {Component, computed, input} from '@angular/core';
import {CardData, CardFaction, CardType, Pack} from '../../../model/cardData';

@Component({
  selector: 'app-card-info',
  imports: [],
  templateUrl: './card-info.component.html',
  styleUrl: './card-info.component.scss',
})
export class CardInfoComponent {
  card = input.required<CardData>();
  correctCard = input.required<CardData>();

  getImg(card: CardData) {
    return `https://marvelcdb.com/bundles/cards/${card.code}.png`;
  }
  cardImg = computed(() => this.getImg(this.card()));

  getEnumKey(enums: any, val: string) {
    return Object.entries(enums).find(([_, v]) => v === val)![0] ?? val;
  }

  getType(type: CardType) {
    return this.getEnumKey(CardType, type);
  }

  getFaction(faction: CardFaction) {
    return this.getEnumKey(CardFaction, faction);
  }

  getPack(pack: string) {
    return this.getEnumKey(Pack, pack).replaceAll(/([A-Z])/g, (c) => ` ${c}`) // convert camel case to spaces;
  }

  //getSet(set: string) {
  //  return set.replace(/^\w/, (c) => c.toUpperCase()).replaceAll(/_(\w)/g, (c) => ` ${c[1].toUpperCase()}`) // convert to camel case
  //}

  answerIsHigher(val?: number, correct?: number) {
    // nothing lower than null (-)
    if (correct == null) {
      return false;
    }

    // higher if val not null
    if (val == null) {
      return true;
    }

    // otherwise if lower
    return val < correct;
  }

  answerIsLower(val?: number, correct?: number) {
    // nothing lower than null (-)
    if (val == null) {
      return false;
    }

    // higher if val not null
    if (correct == null) {
      return true;
    }

    // otherwise if higher
    return val > correct;
  }
}
