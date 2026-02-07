import {Component, computed, input, model} from '@angular/core';
import {CardInfoComponent} from '../card-info/card-info.component';
import {CardData, CardDataArrayField, CardResource, Pack} from '../../../model/cardData';
import {arraysHaveSameValues, getCardImage} from '../../helpers';
import {Filter, FilterType} from '../game.component';
import {PLACEHOLDER_IMAGE} from '../../const';

@Component({
  selector: 'app-guess-info',
  imports: [],
  templateUrl: './guess-info.component.html',
  styleUrls: ['../card-info/card-info.component.scss', './guess-info.component.scss'],
})
export class GuessInfoComponent extends CardInfoComponent {
  guesses = input.required<CardData[]>();
  filter = model.required<Filter[]>();

  cardGuessed = computed(() => this.guesses().includes(this.correctCard()));

  cardNameParts = computed(() => this.getName(this.correctCard()).split(" "));
  guessedWords = computed(() => this.guesses().flatMap(g => this.getName(g).toLowerCase().split(" ")));
  guessNameParts = computed(() => this.cardNameParts().map(p => this.guessedWords().includes(p.toLowerCase()) ? p : this.PLACEHOLDER));

  PLACEHOLDER = "???";

  override cardImg = computed(() => this.cardGuessed() ? getCardImage(this.correctCard()) : PLACEHOLDER_IMAGE);

  getFilterIndex(field: string, value?: unknown) {
    return this.filter().findIndex(f => f.filter == field && (!value || value == f.value));
  }

  removeFilterIfOn(field: string, value?: unknown) {
    let index = this.getFilterIndex(field, value);
    if (index < 0) {
      return false;
    }
    // remove index from filter
    this.filter.update(f => f.filter((_, i) => i !== index));
    return true;
  }

  hasFilter(field: string, value?: unknown) {
    return this.getFilterIndex(field, value) >= 0;
  }

  setFilter(field: keyof CardData) {
    // don't set filter if card was already guessed
    if (this.cardGuessed()) {
      return;
    }
    // check if not guessed yet
    if (this.hasValue(field) == null ) {
      return;
    }
    // toggle filter if already on
    if (this.removeFilterIfOn(field)) {
      return;
    }
    // add to filter
    this.filter.update(f => [...f, {
      filter: field,
      value: this.correctCard()[field],
      array: false
    }]);
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
      case "allPacks":
        if (!this.hasAllPacks()) {
          return;
        }
        value = this.correctCard().packs;
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
    if (this.removeFilterIfOn(field)) {
      return;
    }
    // add to filter
    this.filter.update(f => [...f, {
      filter: field,
      value: value,
      array: false
    }]);
  }

  setFilterArray(field: CardDataArrayField, value: any) {
    // don't set filter if card was already guessed
    if (this.cardGuessed()) {
      return;
    }
    // not guessed yet
    if (!this.hasValueArray(field as any, value as never)) {
      return;
    }
    // extra check for packs to have all packs guessed
    if (field == "packs" && !this.hasAllPacks()) {
      return;
    }
    // toggle filter if already on
    if (this.removeFilterIfOn(field, value)) {
      return;
    }
    // add to filter
    this.filter.update(f => [...f, {
      filter: field,
      value: value,
      array: true
    }]);
  }

  hasValue(field: keyof CardData) {
    let correct = this.correctCard()[field];
    return this.guesses().some(g => g[field] === correct);
  }

  hasValueArray(field: CardDataArrayField, value: never) {
    return this.guesses().some(g => g[field].includes(value));
  }

  hasFirstLetter() {
    let name = this.getName(this.correctCard());
    return this.guesses().some(g => this.getName(g)[0] == name[0]);
  }

  override hasAllResources() {
    let resourceString = this.getResourceString(this.correctCard());
    return this.guesses().some(g => this.getResourceString(g) == resourceString);
  }

  override hasAnyResource() {
    return this.correctCard().resources.some(r => this.hasResource(r));
  }

  hasResource(resource: CardResource) {
    return this.hasValueArray("resources", resource as never);
  }

  hasPack(pack: Pack) {
    return this.hasValueArray("packs", pack as never);
  }

  override hasAllPacks() {
    return this.guesses().some(g => arraysHaveSameValues(g.packs, this.correctCard().packs));
  }

  override hasAnyPack() {
    return this.correctCard().packs.some(p => this.hasPack(p));
  }

  hasTrait(trait: string) {
    return this.hasValueArray("traits", trait as never);
  }

  override hasAllTraits() {
    return this.guesses().some(g => arraysHaveSameValues(g.traits, this.correctCard().traits));
  }

  override hasAnyTrait() {
    return this.correctCard().traits.some(t => this.hasTrait(t));
  }
}
