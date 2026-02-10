import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {DataService} from '../../services/data.service';
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
  getRandomItem,
  getShareLink,
  mapRecordValues,
  ngbDateToISOString,
  sortString
} from '../helpers';
import {NgbDate, NgbInputDatepicker, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {SuccessModalComponent} from './success-modal/success-modal.component';
import confetti from 'canvas-confetti';
import {GITHUB_PAGES_URL, IS_DEV} from '../const';
import {CustomDayComponent} from './custom-day-component/custom-day.component';
import {from} from 'rxjs';

export type FilterType =
  keyof CardData
  | "firstLetter"
  | "allResources"
  | "anyResource"
  | "allTraits"
  | "anyTrait"
  | "allPacks";

export interface Filter {
  filter: FilterType;
  value: any;
  array: boolean;
}

type SavedCardData = { code: string };

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
  modalService = inject(NgbModal);

  // consts
  LOCAL_STORAGE_KEY = "data";
  MINIMUM_SEARCH_LENGTH = 1;
  SHOWN_RESULTS = 25;

  // runtime vars
  loading = signal(false);
  showLegend = signal(false);

  // card data
  cards = signal<CardData[]>([]);
  // current card which should be guessed
  cardToGuess = computed(() => this.getDailyCard());

  // current day
  todayNgbDate = new NgbDate(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, new Date().getUTCDate());
  // the selected data as a ngbdate
  date = signal<NgbDate>(new NgbDate(this.todayNgbDate.year, this.todayNgbDate.month, this.todayNgbDate.day));
  // the selected date as an iso string (YYYY-MM-DD)
  day = computed(() => ngbDateToISOString(this.date()));

  // settings
  germanLanguage = signal(false);
  showSearchImages = signal(true);

  // search
  search = signal("");
  searchResults = computed(() =>
    this.search().length >= this.MINIMUM_SEARCH_LENGTH ?
      this.cards()
        .filter(c => this.matchesFilter(c)) // filter by guess parameter
        .filter(c => this.getName(c).toLowerCase().includes(this.search().toLowerCase())) // filter by name
        .filter(c => !this.guesses().includes(c)) // filter out already guessed cards
      : []);
  shownSearchResults = computed(() => this.searchResults().slice(0, this.SHOWN_RESULTS));
  filter = signal<Filter[]>([]);
  filterDescription = computed(() => this.filter().length ? `[Filter ${this.filter().map(f => `${camelCaseToSpaces(f.filter).toLowerCase()}: ${f.value}`).join(', ')}] ` : "");

  // guesses
  userData = signal<Record<string, CardData[]>>({});
  guesses = computed(() => this.userData()[this.day()] ?? []);
  cardGuessed = computed(() => this.guesses().includes(this.cardToGuess()));

  constructor() {
    // write data to localstorage
    effect(() => {
      // dont write anything
      if (!Object.values(this.userData()).length) {
        return;
      }
      let data = mapRecordValues<string, CardData[], SavedCardData[]>(this.userData(), guesses => guesses
        .map(g => ({code: g.code}))); // only save codes
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(data));
    });
  }

  ngOnInit() {
    // fetch cards
    this.loading.set(true);
    this.dataService.getData().subscribe({
      next: data => {
        this.cards.set(data);
        this.loadGuessesFromLocalStorage();
        this.loading.set(false);
      },
      error: err => {
        console.error(err);
        this.loading.set(false);
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
    this.userData.set(mapRecordValues<string, SavedCardData[], CardData[]>(data, guesses => guesses
      // map saved cards to the actual data
      .map(card => this.cards().find(c => c.code == card.code)!)));
  }

  matchesFilter(card: CardData) {
    let filter = this.filter();
    if (!filter?.length) {
      return true;
    }

    for (let criterium of filter) {
      if (criterium.array) {
        if (!(card[criterium.filter as CardDataArrayField] as any[]).includes(criterium.value)) {
          return false;
        }
      }

      switch (criterium.filter) {
        case 'firstLetter':
          if (this.getName(card)[0] != criterium.value) {
            return false;
          }
          break;
        case 'allResources':
          if (sortString(card.resources.join("")) != criterium.value) {
            return false;
          }
          break;
        case 'anyResource':
          if (!criterium.value.every((r: CardResource) => card.resources.includes(r))) {
            return false;
          }
          break;
        case 'allPacks':
          if (!arraysHaveSameValues(card.packs, criterium.value)) {
            return false;
          }
          break;
        case 'allTraits':
          if (!arraysHaveSameValues(card.traits, criterium.value)) {
            return false;
          }
          break;
        case 'anyTrait':
          if (!criterium.value.every((t: string) => card.traits.includes(t))) {
            return false;
          }
          break;
        default:
          if (card[criterium.filter] != criterium.value) {
            return false;
          }
          break;
      }
    }
    return true;
  }

  getName(card: CardData) {
    return getCardName(card, this.germanLanguage());
  }

  onDayChange() {
    // reset filter
    this.filter.set([]);
  }

  getDailyCard() {
    if (!this.cards().length) {
      return null!;
    }
    return this.getCardForSeed(this.day());
  }

  getCardForSeed(seed: string) {
    return getRandomItem(this.cards(), seed);
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
      this.filter.set([]);
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
    // listen to result
    from(ref.result).subscribe({
      next: result => {
        switch (result) {
          case "reset":
            this.resetDay();
            break;
        }
      }
    })
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
    this.showLegend.update(s => !s);
  }

  resetDay() {
    this.userData.update(u => ({
      ...u,
      [this.day()]: []
    }));
    this.filter.set([]);
    console.log("Reset gueses.");
  }

  // Debug methods
  logSolution() {
    console.log(this.cardToGuess());
  }

  logShareLink() {
    console.log(getShareLink(this.day(), this.guesses(), this.germanLanguage()).replace(GITHUB_PAGES_URL, "http://localhost:4200/"));
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
      cur.setTime(cur.getTime() - (24 * 60 * 60 * 1000));
    }
  }

  hasStartedDate(date: NgbDate) {
    let day = ngbDateToISOString(date);
    return this.userData()[day] && Object.keys(this.userData()[day]).length > 0;
  }

  hasGuessedDate(date: NgbDate) {
    let day = ngbDateToISOString(date);
    let card = this.getCardForSeed(day);
    return this.userData()[day]?.includes(card);
  }

  protected readonly getCardImage = getCardImage;
  protected readonly getFaction = getFaction;
  protected readonly IS_DEV = IS_DEV;
  protected readonly Object = Object;
}
