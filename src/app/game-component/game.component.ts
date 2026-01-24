import {ChangeDetectorRef, Component, computed, inject, OnInit, signal} from '@angular/core';
import {DataService} from '../../services/data.service';
import Rand from 'rand-seed';
import {FormsModule} from '@angular/forms';
import {CardInfoComponent} from './card-info-component/card-info.component';
import {CardData} from '../../model/cardData';
import {GuessInfoComponent} from './guess-info/guess-info.component';
import {getCardImage, getCardName, getFaction} from '../helpers';

@Component({
  selector: 'app-game',
  imports: [
    FormsModule,
    CardInfoComponent,
    GuessInfoComponent
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent implements OnInit {
  dataService = inject(DataService);
  cdr = inject(ChangeDetectorRef);

  loading = false;
  cards: CardData[] = [];
  cardToGuess!: CardData;

  cardGuessed = false;
  showLegend = false;

  MINIMUM_SEARCH_LENGTH = 2;
  SHOWN_RESULTS = 5;
  search = signal("");
  searchResults = computed(() =>
    this.search().length >= this.MINIMUM_SEARCH_LENGTH ?
      this.cards.filter(c => this.getName(c).toLowerCase().includes(this.search().toLowerCase()))
      : []);
  shownSearchResults = computed(() => this.searchResults().slice(0, this.SHOWN_RESULTS));
  showSearchImages = signal(true);
  germanLanguage = signal(false);

  getName(card: CardData) {
    return getCardName(card, this.germanLanguage());
  }

  guesses: CardData[] = [];

  ngOnInit() {
    this.loading = true;
    this.dataService.getData().subscribe({
      next: data => {
        this.cards = data;
        this.cardToGuess = this.getDailyCard();
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

  guessCard(cardData: CardData) {
    if (this.guesses.includes(cardData)) {
      console.log(`Card ${cardData.name} already guessed`);
      return;
    }
    this.guesses.push(cardData);
    if (this.cardToGuess == cardData) {
      console.log("Card guessed!");
      this.cardGuessed = true;
    }
    // clear search
    this.search.set("");
  }

  toggleLegend() {
    this.showLegend = !this.showLegend;
  }

  protected readonly getCardImage = getCardImage;
  protected readonly getFaction = getFaction;
}
