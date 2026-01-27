import {booleanAttribute, Component, computed, input} from '@angular/core';
import {CardData} from '../../../model/cardData';
import {getCardImage, getCardName, getFaction, getPack, getType} from '../../helpers';

@Component({
  selector: 'app-card-info',
  imports: [],
  templateUrl: './card-info.component.html',
  styleUrl: './card-info.component.scss',
})
export class CardInfoComponent {
  card = input.required<CardData>();
  correctCard = input.required<CardData>();
  germanLanguage = input.required<boolean>();
  showBorder = input(true, {transform: booleanAttribute});

  cardImg = computed(() => getCardImage(this.card()));

  getName(card: CardData) {
    return getCardName(card, this.germanLanguage());
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
  protected readonly getCardName = getCardName;
}
