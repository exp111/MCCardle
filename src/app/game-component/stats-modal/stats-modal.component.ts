import {Component, inject} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {UserData} from '../game.component';
import {StatCard} from './stat-card/stat-card';
import {McCardData} from '../../../model/mcCardData';
import {getCardName} from '../../helpers';
import {CardData} from '../../../model/cardData';

@Component({
  selector: 'app-stats-modal',
  imports: [
    StatCard
  ],
  templateUrl: './stats-modal.component.html',
  styleUrl: './stats-modal.component.scss',
})
export class StatsModalComponent {
  activeModal = inject(NgbActiveModal);

  userData!: Record<string, UserData>;
  germanLanguage!: boolean;

  getPlayedDays() {
    return Object.values(this.userData).filter(d => d.guesses?.length);
  }

  getGuessedDays() {
    return this.getPlayedDays().filter(d => d.guesses.includes(d.card));
  }

  getLowestGuessCount() {
    return Math.min(...this.getGuessedDays().map(d => d.guesses.length));
  }

  getHighestGuessCount() {
    return Math.max(...this.getGuessedDays().map(d => d.guesses.length));
  }

  getAverageGuessCount() {
    let guessedDays = this.getGuessedDays();
    return Number((guessedDays.map(d => d.guesses.length).reduce((a, b) => a + b, 0) / guessedDays.length).toFixed(2));
  }

  getMostGuessedCard() {
    let guesses = this.getPlayedDays().flatMap(d => d.guesses);
    let occurances = guesses.reduce((obj, val) => {
      obj[val.code] = (obj[val.code] || 0) + 1;
      return obj;
    }, {} as Record<string, number>);
    let sorted = Object.keys(occurances).sort( function(a,b) {
      return occurances[b] - occurances[a];
    });
    if (!sorted.length) {
      return "Unknown";
    }
    let card = guesses.find(g => g.code == sorted[0]);
    if (!card) {
      return "Unknown";
    }
    return `${this.getCardName(card)} (${occurances[card.code]})`;
  }

  getCardName(card: CardData) {
    return getCardName(card, this.germanLanguage);
  }

  protected readonly Object = Object;
}
