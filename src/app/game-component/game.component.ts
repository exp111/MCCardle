import {ChangeDetectorRef, Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {DataService} from '../../services/data.service';
import Rand from 'rand-seed';
import {FormsModule} from '@angular/forms';
import {CardInfoComponent} from './card-info/card-info.component';
import {CardData} from '../../model/cardData';
import {GuessInfoComponent} from './guess-info/guess-info.component';
import {getCardImage, getCardName, getFaction} from '../helpers';
import {NgbDate, NgbInputDatepicker, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {SuccessModalComponent} from './success-modal/success-modal.component';
import confetti from 'canvas-confetti';

export interface Filter {
  field: keyof CardData;
  value: any;
  array: boolean;
}

@Component({
  selector: 'app-game',
  imports: [
    FormsModule,
    CardInfoComponent,
    GuessInfoComponent,
    NgbInputDatepicker
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss',
})
export class GameComponent implements OnInit {
  dataService = inject(DataService);
  cdr = inject(ChangeDetectorRef);
  modalService = inject(NgbModal);

  loading = false;
  cards = signal<CardData[]>([]);
  cardToGuess = computed(() => this.getDailyCard());
  todayNgbDate = new NgbDate(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, new Date().getUTCDate());
  date = signal<NgbDate>(new NgbDate(this.todayNgbDate.year, this.todayNgbDate.month, this.todayNgbDate.day));
  day = computed(() => `${this.date().year}-${this.date().month.toString().padStart(2, "0")}-${this.date().day.toString().padStart(2, "0")}`);

  cardGuessed = computed(() => this.guesses().includes(this.cardToGuess()));
  showLegend = false;

  MINIMUM_SEARCH_LENGTH = 1;
  SHOWN_RESULTS = 5;
  search = signal("");
  searchResults = computed(() =>
    this.search().length >= this.MINIMUM_SEARCH_LENGTH ?
      this.cards()
        .filter(c => this.filter() ?
          this.filter()!.array ?
            (c[this.filter()!.field] as any[]).includes(this.filter()!.value)
            : c[this.filter()!.field] == this.filter()!.value
          : true) // filter by guess parameter
        .filter(c => this.getName(c).toLowerCase().includes(this.search().toLowerCase())) // filter by name
        .filter(c => !this.guesses().includes(c)) // filter out already guessed cards
      : []);
  shownSearchResults = computed(() => this.searchResults().slice(0, this.SHOWN_RESULTS));
  showSearchImages = signal(true);
  filter = signal<Filter | null>(null);
  filterDescription = computed(() => this.filter() ? `[Filter ${this.filter()!.field}: ${this.filter()!.value}] ` : "");
  germanLanguage = signal(false);

  getName(card: CardData) {
    return getCardName(card, this.germanLanguage());
  }

  guesses = signal<CardData[]>([]);

  LOCAL_STORAGE_KEY = "data";
  saveToLocalStorageEffect = effect(() => {
    // dont write empty stuff into storage
    if (!this.guesses().length) {
      return;
    }
    let data = this.getLocalStorage();
    if (data == null) {
      data = {};
    }
    data[this.day()] = this.guesses();
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(data));
  });

  getLocalStorage() {
    let data = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }

  ngOnInit() {
    this.loading = true;
    this.dataService.getData().subscribe({
      next: data => {
        this.cards.set(data);
        this.loadGuessesFromLocalStorage();
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

  onDayChange() {
    // load guesses for date
    this.loadGuessesFromLocalStorage();
    // reset filter
    this.filter.set(null);
  }

  loadGuessesFromLocalStorage() {
    // read from local storage
    let data = this.getLocalStorage();
    this.guesses.set(data ? (data[this.day()] ?? [])
      // map saved cards to the actual data
      .map((card: CardData) => this.cards().find(c => c.code == card.code)) : []);
  }

  getDailyCard() {
    if (!this.cards().length) {
      return null!;
    }
    let random = new Rand(this.day());
    let index = Math.floor(random.next() * this.cards().length);
    return this.cards()[index];
  }

  guessCard(cardData: CardData) {
    if (this.guesses().includes(cardData)) {
      console.log(`Card ${cardData.name} already guessed`);
      return;
    }
    this.guesses.update(g => [...g, cardData]);
    if (this.cardToGuess() == cardData) {
      console.log("Card guessed!");
      // reset filter
      this.filter.set(null);
      // show user success
      this.showSuccessModal();
      this.confetti();
    }
    // clear search
    this.search.set("");
  }

  showSuccessModal() {
    let ref = this.modalService.open(SuccessModalComponent, {size: "lg"});
    let instance = ref.componentInstance as SuccessModalComponent;
    instance.card = this.cardToGuess();
    instance.germanLanguage = this.germanLanguage();
    instance.guesses = this.guesses();
    instance.day = this.day();
  }

  confetti() {
    const duration = 3000; // in milliseconds

    confetti({
      zIndex: 1060, // higher than modal
      particleCount: 150,
      spread: 180,
      origin: {y: -0.1},
      startVelocity: -35
    });

    // Clear confetti after a certain duration
    setTimeout(() => confetti.reset(), duration);
  }

  toggleLegend() {
    this.showLegend = !this.showLegend;
  }

  protected readonly getCardImage = getCardImage;
  protected readonly getFaction = getFaction;
}
