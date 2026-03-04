import {Component, computed, input} from '@angular/core';
import {CardData} from '../../../../model/cardData';

@Component({
  selector: 'guess-info-attribute',
  imports: [],
  templateUrl: './guess-info-attribute.component.html',
  styleUrls: ['../../card-info/card-info-attribute/card-info-attribute.component.scss', './guess-info-attribute.component.scss'],
})
export class GuessInfoAttributeComponent {
  card = input.required<CardData>();
  field = input.required<keyof CardData>();
  guesses = input.required<CardData[]>();
  displayFunc = input<(c: CardData) => string>((c: CardData) => c[this.field()]!.toString());
  name = input.required<string>();

  PLACEHOLDER = input.required<string>();
  hasFilter = input.required<(field: string, value?: unknown) => boolean>();
  setFilter = input.required<(field: keyof CardData) => void>();

  displayValue = computed(() => this.displayFunc()(this.card()));
  hasValue = computed(() => this.guesses().some(g => g[this.field()] === this.card()[this.field()]));
  computedDisplay = computed(() => this.hasValue() ? this.displayValue() : this.PLACEHOLDER());
}
