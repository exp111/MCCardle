import {booleanAttribute, Component, computed, input} from '@angular/core';
import {McCardData} from '../../../model/mcCardData';
import {
  arraysHaveSameValues,
  getMcCardImage,
  getMcCardDBURL,
  getCardName,
  getMcFaction,
  getMcPack,
  getMcType,
  sortString
} from '../../helpers';
import {NgTemplateOutlet} from '@angular/common';
import {IS_DEV} from '../../const';
import {CardInfoAttribute} from './card-info-attribute/card-info-attribute.component';

@Component({
  selector: 'app-card-info',
  imports: [
    NgTemplateOutlet,
    CardInfoAttribute
  ],
  templateUrl: './card-info.component.html',
  styleUrl: './card-info.component.scss',
})
export class CardInfoComponent {
  card = input.required<McCardData>();
  correctCard = input.required<McCardData>();
  germanLanguage = input.required<boolean>();
  showBorder = input(true, {transform: booleanAttribute});
  showMarvelCDBLink = input(false);

  cardImg = computed(() => getMcCardImage(this.card()));

  getName(card: McCardData) {
    return getCardName(card, this.germanLanguage());
  }

  getCost(card: McCardData) {
    return (card.cost ?? "-").toString();
  }

  getType(card: McCardData) {
    return getMcType(card.type);
  }

  getFaction(card: McCardData) {
    return getMcFaction(card.faction);
  }

  hasAllResources() {
    return this.getResourceString(this.correctCard()) == this.getResourceString(this.card());
  }

  hasAnyResource() {
    return this.card().resources.some(r => this.correctCard().resources.includes(r));
  }

  getResourceString(card: McCardData) {
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

  protected readonly getPack = getMcPack;
  protected readonly getCardMarvelCDBURL = getMcCardDBURL;
  protected readonly IS_DEV = IS_DEV;
}
