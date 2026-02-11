import {booleanAttribute, Component, computed, inject, input, OnInit, signal} from '@angular/core';
import {CardData} from '../../model/cardData';
import {DataService} from '../../services/data.service';
import {getCardName} from '../helpers';
import {CardInfoComponent} from '../game-component/card-info/card-info.component';
import {Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-viewer-component',
  imports: [
    CardInfoComponent,
    RouterLink
  ],
  templateUrl: './viewer.component.html',
  styleUrl: './viewer.component.scss',
})
export class ViewerComponent implements OnInit {
  router = inject(Router);
  dataService = inject(DataService);

  // parameters
  day = input.required<string>();
  code = input.required<string>();
  guesses = input.required({
    transform: (v: string) => v ? v.split(",") : []
  });
  german = input(false, {
    transform: booleanAttribute
  });

  loading = signal(false);
  // contains the guessed cards as card data
  cardGuesses = computed(() => this.cards() && this.guesses() ?
    this.guesses().map(g => this.getCardByCode(g))
    : []);
  cards = signal<CardData[]>([]);
  card = computed(() => this.cards() && this.code() ? this.getCardByCode(this.code()) : {name: "Card not found."} as CardData);

  ngOnInit() {
    // check if required parameters exist
    if (!this.day() || !this.code() || !this.guesses()?.length) {
      console.error("Invalid viewer link.");
      this.router.navigate(["/"]);
      return;
    }
    this.loading.set(true);
    this.dataService.getData().subscribe({
      next: data => {
        this.cards.set(data);
        this.loading.set(false);
      },
      error: err => {
        console.error(err);
        this.loading.set(false);
      }
    })
  }

  getName(card: CardData) {
    return getCardName(card, this.german());
  }

  getCardByCode(code: string) {
    return this.cards().find(c => c.code == code)!;
  }
}
