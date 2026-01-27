import {Component, computed, input, model, output} from '@angular/core';
import {CardInfoComponent} from '../card-info-component/card-info.component';
import {CardData, CardDataArrayField, CardResource, Pack} from '../../../model/cardData';
import {getCardImage} from '../../helpers';
import {Filter} from '../game.component';

@Component({
  selector: 'app-guess-info',
  imports: [],
  templateUrl: './guess-info.component.html',
  styleUrls: ['../card-info-component/card-info.component.scss', './guess-info.component.scss'],
})
export class GuessInfoComponent extends CardInfoComponent {
  guesses = input.required<CardData[]>();
  filter = model<Filter | null>();

  PLACEHOLDER = "???";

  override cardImg = computed(() => this.guesses().includes(this.correctCard()) ? getCardImage(this.correctCard()) : "placeholder.png");

  setFilter(field: keyof CardData) {
    // not guessed yet
    if (this.value(field) == null ) {
      return;
    }
    // toggle filter if already on
    if (this.filter()?.field == field) {
      this.filter.set(null);
      return;
    }
    // set filter
    this.filter.set({
      field: field,
      value: this.correctCard()[field],
      array: false
    });
  }

  setFilterArray(field: CardDataArrayField, value: any) {
    // not guessed yet
    if (!this.hasValue(field as any, value as never)) {
      return;
    }
    // toggle filter if already on
    if (this.filter()?.field == field && this.filter()?.value == value) {
      this.filter.set(null);
      return;
    }
    // set filter
    this.filter.set({
      field: field,
      value: value,
      array: true
    });
  }

  value(field: keyof CardData) {
    let correct = this.correctCard()[field];
    for (let guess of this.guesses()) {
      if (guess[field] == correct) {
        return correct;
      }
    }
    return null;
  }

  hasValue(field: CardDataArrayField, value: never) {
    return this.guesses().some(g => g[field].includes(value));
  }

  hasResource(resource: CardResource) {
    return this.hasValue("resources", resource as never);
  }

  hasPack(pack: Pack) {
    return this.hasValue("packs", pack as never);
  }

  hasTrait(trait: string) {
    return this.hasValue("traits", trait as never);
  }
}
