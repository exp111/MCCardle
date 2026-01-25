import {ChangeDetectorRef, Component, computed, inject, OnInit, signal} from '@angular/core';
import {DataService} from '../../services/data.service';
import Rand from 'rand-seed';
import {FormsModule} from '@angular/forms';
import {CardInfoComponent} from './card-info-component/card-info.component';
import {CardData} from '../../model/cardData';
import {GuessInfoComponent} from './guess-info/guess-info.component';
import {getCardImage, getCardName, getFaction} from '../helpers';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {SuccessModalComponent} from './success-modal/success-modal.component';
import confetti from 'canvas-confetti';

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
  modalService = inject(NgbModal);

  loading = false;
  cards = signal<CardData[]>([]);
  cardToGuess = computed(() => this.getDailyCard());
  today = new Date().toISOString().split('T')[0];
  day = signal<string>(this.today);

  cardGuessed = false;
  showLegend = false;

  MINIMUM_SEARCH_LENGTH = 2;
  SHOWN_RESULTS = 5;
  search = signal("");
  searchResults = computed(() =>
    this.search().length >= this.MINIMUM_SEARCH_LENGTH ?
      this.cards().filter(c => this.getName(c).toLowerCase().includes(this.search().toLowerCase()))
      : []);
  shownSearchResults = computed(() => this.searchResults().slice(0, this.SHOWN_RESULTS));
  showSearchImages = signal(true);
  germanLanguage = signal(false);

  getName(card: CardData) {
    return getCardName(card, this.germanLanguage());
  }

  guesses = signal<CardData[]>([]);

  ngOnInit() {
    this.loading = true;
    this.dataService.getData().subscribe({
      next: data => {
        this.cards.set(data);
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

  resetGuesses() {
    this.cardGuessed = false;
    this.guesses.set([]);
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
      this.cardGuessed = true;
      this.showSuccessModal();
    }
    // clear search
    this.search.set("");
  }

  showSuccessModal() {
    let ref = this.modalService.open(SuccessModalComponent, {size: "lg"});
    let instance = ref.componentInstance as SuccessModalComponent;
    instance.card = this.cardToGuess();
    instance.germanLanguage = this.germanLanguage();
    this.confetti();
  }

  confetti() {
    const duration = 3000; // in milliseconds

    confetti({
      zIndex: 1060, // higher than modal
      particleCount: 150,
      spread: 180,
      origin: { y: -0.1 },
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
