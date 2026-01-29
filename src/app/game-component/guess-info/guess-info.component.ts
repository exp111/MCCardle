import {Component, computed, input, model} from '@angular/core';
import {CardInfoComponent} from '../card-info/card-info.component';
import {CardData, CardDataArrayField, CardResource, Pack} from '../../../model/cardData';
import {arraysHaveSameValues, getCardImage} from '../../helpers';
import {Filter, FilterType} from '../game.component';

@Component({
  selector: 'app-guess-info',
  imports: [],
  templateUrl: './guess-info.component.html',
  styleUrls: ['../card-info/card-info.component.scss', './guess-info.component.scss'],
})
export class GuessInfoComponent extends CardInfoComponent {
  guesses = input.required<CardData[]>();
  filter = model<Filter | null>();

  cardGuessed = computed(() => this.guesses().includes(this.correctCard()));

  PLACEHOLDER = "???";

  override cardImg = computed(() => this.cardGuessed() ? getCardImage(this.correctCard()) : "placeholder.png");

  setFilter(field: keyof CardData) {
    // don't set filter if card was already guessed
    if (this.cardGuessed()) {
      return;
    }
    // check if not guessed yet
    if (this.value(field) == null ) {
      return;
    }
    // toggle filter if already on
    if (this.filter()?.filter == field) {
      this.filter.set(null);
      return;
    }
    // set filter
    this.filter.set({
      filter: field,
      value: this.correctCard()[field],
      array: false
    });
  }

  setFilterCustom(field: FilterType, value?: any) {
    // don't set filter if card was already guessed
    if (this.cardGuessed()) {
      return;
    }
    // check if not guessed yet
    switch (field) {
      case "firstLetter":
        if (!this.hasFirstLetter()) {
          return;
        }
        break;
      case "allResources":
        if (!this.hasAllResources()) {
          return;
        }
        value = this.getResourceString(this.correctCard());
        break;
      case "anyResource":
        if (!this.hasAnyResource()) {
          return;
        }
        value = this.correctCard().resources
          .filter(r => this.hasResource(r))
          .filter((r,i,s) => s.indexOf(r) === i); // unique
        break;
      case "allTraits":
        if (!this.hasAllTraits()) {
          return;
        }
        value = this.correctCard().traits;
        break;
        case "anyTrait":
          if (!this.hasAnyTrait()) {
            return;
          }
          value = this.correctCard().traits.filter(t => this.hasTrait(t));
          break;
      default:
        console.error(`Unknown filter: ${field}`);
        return;
    }

    // toggle filter if already on
    if (this.filter()?.filter == field) {
      this.filter.set(null);
      return;
    }
    // set filter
    this.filter.set({
      filter: field,
      value: value,
      array: false
    });
  }

  setFilterArray(field: CardDataArrayField, value: any) {
    // not guessed yet
    if (!this.hasValue(field as any, value as never)) {
      return;
    }
    // toggle filter if already on
    if (this.filter()?.filter == field && this.filter()?.value == value) {
      this.filter.set(null);
      return;
    }
    // set filter
    this.filter.set({
      filter: field,
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

  hasFirstLetter() {
    let name = this.getName(this.correctCard());
    return this.guesses().some(g => this.getName(g)[0] == name[0]);
  }

  hasValue(field: CardDataArrayField, value: never) {
    return this.guesses().some(g => g[field].includes(value));
  }

  override hasAllResources() {
    let resourceString = this.getResourceString(this.correctCard());
    return this.guesses().some(g => this.getResourceString(g) == resourceString);
  }

  override hasAnyResource() {
    return this.correctCard().resources.some(r => this.hasResource(r));
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

  override hasAllTraits() {
    return this.guesses().some(g => arraysHaveSameValues(g.traits, this.correctCard().traits));
  }

  override hasAnyTrait() {
    return this.correctCard().traits.some(t => this.hasTrait(t));
  }
}
