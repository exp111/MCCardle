import {ChangeDetectorRef, Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {DataService} from '../../services/data.service';
import Rand from 'rand-seed';
import {FormsModule} from '@angular/forms';
import {CardInfoComponent} from './card-info/card-info.component';
import {CardData, CardDataArrayField, CardResource} from '../../model/cardData';
import {GuessInfoComponent} from './guess-info/guess-info.component';
import {
  arraysHaveSameValues,
  camelCaseToSpaces,
  getCardImage,
  getCardName,
  getFaction,
  mapRecordValues,
  sortString
} from '../helpers';
import {NgbDate, NgbInputDatepicker, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {SuccessModalComponent} from './success-modal/success-modal.component';
import confetti from 'canvas-confetti';
import {IS_DEV} from '../const';
import {CustomDayComponent} from './custom-day-component/custom-day.component';

export type FilterType = keyof CardData | "firstLetter" | "allResources" | "anyResource" | "allTraits" | "anyTrait" | "allPacks";

export interface Filter {
  filter: FilterType;
  value: any;
  array: boolean;
}

type SavedCardData = {code: string};

@Component({
  selector: 'app-game',
  imports: [
    FormsModule,
    CardInfoComponent,
    GuessInfoComponent,
    NgbInputDatepicker,
    CustomDayComponent
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
  // the selected data as a ngbdate
  date = signal<NgbDate>(new NgbDate(this.todayNgbDate.year, this.todayNgbDate.month, this.todayNgbDate.day));
  // the selected date as a iso string (YYYY-MM-DD)
  day = computed(() => `${this.date().year}-${this.date().month.toString().padStart(2, "0")}-${this.date().day.toString().padStart(2, "0")}`);

  cardGuessed = computed(() => this.guesses().includes(this.cardToGuess()));
  showLegend = false;

  MINIMUM_SEARCH_LENGTH = 1;
  SHOWN_RESULTS = 25;
  search = signal("");
  searchResults = computed(() =>
    this.search().length >= this.MINIMUM_SEARCH_LENGTH ?
      this.cards()
        .filter(c => this.matchesFilter(c)) // filter by guess parameter
        .filter(c => this.getName(c).toLowerCase().includes(this.search().toLowerCase())) // filter by name
        .filter(c => !this.guesses().includes(c)) // filter out already guessed cards
      : []);
  shownSearchResults = computed(() => this.searchResults().slice(0, this.SHOWN_RESULTS));
  showSearchImages = signal(true);
  filter = signal<Filter | null>(null);
  filterDescription = computed(() => this.filter() ? `[Filter ${camelCaseToSpaces(this.filter()!.filter).toLowerCase()}: ${this.filter()!.value}] ` : "");
  germanLanguage = signal(false);

  userData = signal<Record<string, CardData[]>>({});
  guesses = computed(() => this.userData()[this.day()] ?? []);

  LOCAL_STORAGE_KEY = "data";
  saveToLocalStorageEffect = effect(() => {
    // dont write anything
    if (!Object.values({}).length) {
      return;
    }
    let data = mapRecordValues<string, CardData[], SavedCardData[]>(this.userData(), guesses => guesses
      .map(g => ({code: g.code}))); // only save codes
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(data));
  });

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

  getLocalStorage() {
    let data = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }

  loadGuessesFromLocalStorage() {
    let data = this.getLocalStorage();
    if (!data) {
      console.log("No data found.");
      return;
    }
    this.userData.set(mapRecordValues<string, SavedCardData[], CardData[]>(data, guesses  => guesses
      // map saved cards to the actual data
      .map(card => this.cards().find(c => c.code == card.code)!)));
  }

  matchesFilter(card: CardData) {
    let filter = this.filter();
    if (!filter) {
      return true;
    }

    if (filter.array) {
      return (card[filter.filter as CardDataArrayField] as any[]).includes(filter.value);
    }

    switch (filter.filter) {
      case 'firstLetter':
        return this.getName(card)[0] == filter.value;
      case 'allResources':
        return sortString(card.resources.join("")) == filter.value;
      case 'anyResource':
        return filter.value.every((r: CardResource) => card.resources.includes(r));
      case 'allPacks':
        return arraysHaveSameValues(card.packs, filter.value);
      case 'allTraits':
        return arraysHaveSameValues(card.traits, filter.value);
      case 'anyTrait':
        return filter.value.every((t: string) => card.traits.includes(t));
      default:
        return card[filter.filter] == filter.value;
    }
  }

  getName(card: CardData) {
    return getCardName(card, this.germanLanguage());
  }

  onDayChange() {
    // reset filter
    this.filter.set(null);
  }

  getDailyCard() {
    if (!this.cards().length) {
      return null!;
    }
    return this.getCardForSeed(this.day());
  }

  getCardForSeed(seed: string) {
    let random = new Rand(seed);
    let index = Math.floor(random.next() * this.cards().length);
    return this.cards()[index];
  }

  guessCard(cardData: CardData) {
    if (this.guesses().includes(cardData)) {
      console.log(`Card ${cardData.name} already guessed`);
      return;
    }
    // add guess to guesses
    this.userData.update(u => ({
      ...u,
      [this.day()]: [...u[this.day()] ?? [], cardData]
    }));
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

  // Debug methods
  resetToday() {
    this.userData.update(u => ({
      ...u,
      [this.day()]: []
    }));
    this.filter.set(null);
  }

  logSolution() {
    console.log(this.cardToGuess());
  }

  setDayForCode() {
    let code = prompt("Enter code");
    if (code == null || !this.cards().find(c => c.code == code)) {
      console.error(`Invalid code ${code}`);
      return;
    }
    let cur = new Date();
    while (true) {
      let seed = cur.toISOString().split('T')[0];
      let card = this.getCardForSeed(seed);
      if (card.code == code) {
        console.log(`For card ${card.name} (${card.code}) use day ${seed}`);
        this.date.set(new NgbDate(cur.getUTCFullYear(), cur.getUTCMonth() + 1, cur.getUTCDate()));
        this.onDayChange();
        return;
      }
      // reduce by 1 day
      cur.setTime(cur.getTime() - (24*60*60*1000));
    }
  }

  protected readonly getCardImage = getCardImage;
  protected readonly getFaction = getFaction;
  protected readonly IS_DEV = IS_DEV;
}
