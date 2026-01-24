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

  cardImg = computed(() => `https://marvelcdb.com/bundles/cards/${this.card().code}.png`);

  getEnumKey(enums: any, val: string) {
    return Object.entries(enums).find(([_, v]) => v === val)![0] ?? val;
  }

  getType() {
    return this.getEnumKey(CardType, this.card().type);
  }

  getFaction() {
    return this.getEnumKey(CardFaction, this.card().faction);
  }

  getPack(pack: string) {
    return this.getEnumKey(Pack, pack).replaceAll(/([A-Z])/g, (c) => ` ${c}`) // convert camel case to spaces;
  }
}
