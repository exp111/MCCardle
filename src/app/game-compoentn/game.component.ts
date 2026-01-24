import {ChangeDetectorRef, Component, computed, inject, OnInit, signal} from '@angular/core';
import {DataService} from '../../services/data.service';
import Rand from 'rand-seed';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-game-compoentn',
  imports: [
    FormsModule
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent implements OnInit {
  dataService = inject(DataService);
  cdr = inject(ChangeDetectorRef);

  loading = false;
  cards: CardData[] = [];
  card!: CardData;

  MINIMUM_SEARCH_LENGTH = 2;
  SHOWN_RESULTS = 5;
  search = signal("");
  searchResults = computed(() =>
    this.search().length >= this.MINIMUM_SEARCH_LENGTH ?
      this.cards.filter(c => c.name.toLowerCase().includes(this.search().toLowerCase()))
      : []);
  shownSearchResults = computed(() => this.searchResults().slice(0, this.SHOWN_RESULTS));

  guesses: CardData[] = [];

  ngOnInit() {
    this.loading = true;
    this.dataService.getData().subscribe({
      next: data => {
        this.cards = data;
        this.card = this.getDailyCard();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    })
  }

  getDailyCard() {
    let day = new Date();
    let str = `${day.getUTCFullYear()}-${day.getUTCMonth() + 1}-${day.getUTCDate()}`;
    let random = new Rand(str);
    let index = Math.floor(random.next() * this.cards.length);
    return this.cards[index];
  }
}
