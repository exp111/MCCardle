import {Component, computed, input} from '@angular/core';
import {CardInfoComponent} from '../card-info-component/card-info.component';
import {CardData, CardResource, Pack} from '../../../model/cardData';

@Component({
  selector: 'app-guess-info',
  imports: [],
  templateUrl: './guess-info.component.html',
  styleUrls: ['../card-info-component/card-info.component.scss', './guess-info.component.scss'],
})
export class GuessInfoComponent extends CardInfoComponent {
  guesses = input.required<CardData[]>();

  PLACEHOLDER = "???";

  override cardImg = computed(() => this.guesses().includes(this.correctCard()) ? this.getImg(this.correctCard()) : "placeholder.png");

  value(field: keyof CardData) {
    let correct = this.correctCard()[field];
    for (let guess of this.guesses()) {
      if (guess[field] == correct) {
        return correct;
      }
    }
    return null;
  }

  hasResource(resource: CardResource) {
    return this.guesses().some(g => g.resources.includes(resource));
  }

  hasPack(pack: Pack) {
    return this.guesses().some(g => g.packs.includes(pack));
  }
}
