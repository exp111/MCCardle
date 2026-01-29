import {booleanAttribute, Component, computed, input} from '@angular/core';
import {CardData} from '../../../model/cardData';
import {
  arraysHaveSameValues,
  getCardImage,
  getCardMarvelCDBURL,
  getCardName,
  getFaction,
  getPack,
  getType,
  sortString
} from '../../helpers';
import {NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'app-card-info',
  imports: [
    NgTemplateOutlet
  ],
  templateUrl: './card-info.component.html',
  styleUrl: './card-info.component.scss',
})
export class CardInfoComponent {
  card = input.required<CardData>();
  correctCard = input.required<CardData>();
  germanLanguage = input.required<boolean>();
  showBorder = input(true, {transform: booleanAttribute});
  showMarvelCDBLink = input(false);

  cardImg = computed(() => getCardImage(this.card()));

  getName(card: CardData) {
    return getCardName(card, this.germanLanguage());
  }

  hasAllResources() {
    return this.getResourceString(this.correctCard()) == this.getResourceString(this.card());
  }

  hasAnyResource() {
    return this.card().resources.some(r => this.correctCard().resources.includes(r));
  }

  getResourceString(card: CardData) {
    return sortString(card.resources.join(""));
  }

  hasAllPacks() {
    return arraysHaveSameValues(this.card().packs, this.correctCard().packs);
  }

  hasAnyPack() {
    return this.card().packs.some(p => this.correctCard().packs.includes(p));
  }

  hasAllTraits() {
    return arraysHaveSameValues(this.card().traits, this.correctCard().traits);
  }

  hasAnyTrait() {
    return this.card().traits.some(t => this.correctCard().traits.includes(t));
  }

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

  protected readonly getPack = getPack;
  protected readonly getFaction = getFaction;
  protected readonly getType = getType;
  protected readonly getCardMarvelCDBURL = getCardMarvelCDBURL;
}
