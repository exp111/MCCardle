import {Component, inject} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {CardData, CardDataArrayField} from '../../../model/cardData';
import {CardInfoComponent} from '../card-info-component/card-info.component';
import {getCardName} from '../../helpers';

@Component({
  selector: 'app-success-modal',
  imports: [
    CardInfoComponent
  ],
  templateUrl: './success-modal.component.html',
  styleUrl: './success-modal.component.scss',
})
export class SuccessModalComponent {
  activeModal = inject(NgbActiveModal);

  card!: CardData;
  germanLanguage!: boolean;
  guesses!: CardData[];
  day!: string;

  WRONG_EMOJI = "⬛";
  PARTIALLY_CORRECT_EMOJI = "🟨";
  CORRECT_EMOJI = "🟩";

  share() {
    let share = `Marvel Champions Cardle ${this.day} in ${this.guesses.length} Guesses\n`;
    share += "https://exp111.github.io/MCCardle/\n\n";

    let tries: string[] = [];
    for (let guess of this.guesses) {
      let text = '';
      text += this.checkValue(guess, "name");
      text += this.checkValue(guess, "type");
      text += this.checkValue(guess, "faction");
      text += this.checkArray(guess, "resources");
      text += this.checkArray(guess, "packs");
      text += this.checkArray(guess, "traits");
      tries.push(text);
    }
    share += tries.join("\n");
    navigator.clipboard.writeText(share);
  }

  checkValue(guess: CardData, field: keyof CardData) {
    return this.card[field] == guess[field] ? this.CORRECT_EMOJI : this.WRONG_EMOJI;
  }

  checkArray(guess: CardData, field: CardDataArrayField) {
    let correctArray = this.card[field];
    let guessArray = guess[field];
    let matches = guessArray.filter(v => correctArray.includes(v as never)).length;
    return matches == correctArray.length ? this.CORRECT_EMOJI :
      matches > 0 ? this.PARTIALLY_CORRECT_EMOJI
        : this.WRONG_EMOJI;
  }
}
