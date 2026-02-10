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

// saved data
interface SaveData {
  // code of the gard to guess
  card: string;
  // codes of the cards guessed
  guesses: string[];
}

// data for the day
interface UserData {
  card: CardData;
  guesses: CardData[];
}

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
  LOCAL_STORAGE_DATA_KEY = "data";
  LOCAL_STORAGE_SCHEMA_VERSION_KEY = "schema_version";
  MINIMUM_SEARCH_LENGTH = 1;
  SHOWN_RESULTS = 25;
  SCHEMA_VERSION = "1";

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
  userData = signal<Record<string, UserData>>({});
  guesses = computed(() => this.userData()[this.day()]?.guesses ?? []);
  cardGuessed = computed(() => this.guesses().includes(this.cardToGuess()));

  constructor() {
    // write data to localstorage
    effect(() => {
      // dont write anything
      if (!Object.values(this.userData()).length) {
        return;
      }
      let data = mapRecordValues<string, UserData, SaveData>(this.userData(), d => ({
        card: d.card.code,
        guesses: d.guesses.map(g => g.code) // only save codes
      }));
      localStorage.setItem(this.LOCAL_STORAGE_DATA_KEY, JSON.stringify(data));
    });
  }

  ngOnInit() {
    // fetch cards
    this.loading.set(true);
    this.dataService.getData().subscribe({
      next: data => {
        this.cards.set(data);
        this.loadDataFromLocalStorage();
        this.loading.set(false);
      },
      error: err => {
        console.error(err);
        this.loading.set(false);
      }
    })
  }

  loadDataFromLocalStorage() {
    let data = this.getLocalStorageData();
    if (!data) {
      console.log("No data found.");
      return;
    }
    // migrate data if needed
    data = this.migrateLocalStorageData(data);
    this.userData.set(mapRecordValues<string, SaveData, UserData>(data, d => ({
      // map saved cards to the actual data
      card: this.getCardByCode(d.card)!,
      guesses: d.guesses.map(c => this.getCardByCode(c)!)
    })));
  }

  // migrates data from an old schema version
  migrateLocalStorageData(data: any) {
    // no data => no migration needed
    if (!data) {
      console.log("No migration needed as no data was found.");
      this.writeSchemaVersion();
      return data;
    }
    let schema = localStorage.getItem(this.LOCAL_STORAGE_SCHEMA_VERSION_KEY);
    // if schema is up-to-date, no migration needed
    if (schema == this.SCHEMA_VERSION) {
      console.log(`No migration needed (current version ${schema}).`);
      return data;
    }
    console.log(`Trying to migrate from schema version ${schema}`);
    // migrate data into one that fits into current schema
    let d;
    switch (schema) {
      default:
        // first schema (no version number): map<string, {<day>: {code: string}[]}
        d = mapRecordValues<string, {code: string}[], SaveData>(data, (d, k) => ({
          card: this.getCardForSeed(k).code,
          guesses: d.map(c => c.code)
        }));
        break;
    }
    // migration finished, write current schema
    this.writeSchemaVersion();
    console.log(`Finished migration to version ${this.SCHEMA_VERSION}`);
    return d;
  }

  writeSchemaVersion() {
    localStorage.setItem(this.LOCAL_STORAGE_SCHEMA_VERSION_KEY, this.SCHEMA_VERSION);
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

  onDayChange() {
    // reset filter
    this.filter.set([]);
  }

  getDailyCard() {
    if (!this.cards().length) {
      return null!;
    }
    // if there is a saved card use that one - otherwise generate for the current date
    return this.userData()[this.day()]?.card ?? this.getCardForSeed(this.day());
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
      [this.day()]: {card: this.cardToGuess(), guesses: [...u[this.day()]?.guesses ?? [], cardData]}
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
      [this.day()]: {card: this.getCardForSeed(this.day()), guesses: []}
    }));
    this.filter.set([]);
    console.log("Reset gueses.");
  }

  // Helpers
  getCardByCode(code: string) {
    return this.cards().find(c => c.code == code);
  }

  getName(card: CardData) {
    return getCardName(card, this.germanLanguage());
  }

  getLocalStorageData() {
    let data = localStorage.getItem(this.LOCAL_STORAGE_DATA_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }

  // Debug methods
  logSolution() {
    console.log(this.cardToGuess());
  }

  logSolutionNoCache() {
    console.log(this.getCardForSeed(this.day()));
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
    return this.userData()[day] && Object.keys(this.userData()[day]?.guesses).length > 0;
  }

  hasGuessedDate(date: NgbDate) {
    let day = ngbDateToISOString(date);
    let data = this.userData()[day];
    return data?.guesses.includes(data?.card);
  }

  protected readonly getCardImage = getCardImage;
  protected readonly getFaction = getFaction;
  protected readonly IS_DEV = IS_DEV;
  protected readonly Object = Object;
}
