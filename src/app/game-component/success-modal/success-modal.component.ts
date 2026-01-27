import {Component, inject} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {CardData, CardDataArrayField} from '../../../model/cardData';
import {CardInfoComponent} from '../card-info/card-info.component';
import {getCardName} from '../../helpers';
import {ToastService} from '../../../services/toast.service';
import {GITHUB_PAGES_URL} from '../../const';

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
  toastService = inject(ToastService);

  card!: CardData;
  germanLanguage!: boolean;
  guesses!: CardData[];
  day!: string;

  WRONG_EMOJI = "⬛";
  PARTIALLY_CORRECT_EMOJI = "🟨";
  CORRECT_EMOJI = "🟩";

  share(addSpoileredCardName = false) {
    let share = `Marvel Champions Cardle ${this.day} in ${this.guesses.length} Guesses\n`;
    share += `${GITHUB_PAGES_URL}\n\n`;

    let tries: string[] = [];
    for (let guess of this.guesses) {
      let text = '';
      text += this.checkValue(guess, "name");
      text += this.checkValue(guess, "type");
      text += this.checkValue(guess, "faction");
      text += this.checkArray(guess, "resources");
      text += this.checkArray(guess, "packs");
      text += this.checkArray(guess, "traits");
      if (addSpoileredCardName) {
        text += ` ||${this.getName(guess)}||`;
      }
      tries.push(text);
    }
    share += tries.join("\n");
    // write to clipboard + toast
    try {
      navigator.clipboard.writeText(share).then(() => {
        this.toastService.show({
          content: "Copied to clipboard."
        });
      });
    } catch (error) {
      console.log(error);
      this.toastService.show({
        content: "Could not write to clipboard."
      })
    }
  }

  checkValue(guess: CardData, field: keyof CardData) {
    return this.card[field] == guess[field] ? this.CORRECT_EMOJI : this.WRONG_EMOJI;
  }

  checkArray(guess: CardData, field: CardDataArrayField) {
    let correctArray = this.card[field];
    let guessArray = guess[field];
    let matches = guessArray.filter(v => correctArray.includes(v as never)).length;
    // if arrays completely match, return green. if partially matched, return orange. otherwise wrong
    return matches == correctArray.length && matches == guessArray.length ? this.CORRECT_EMOJI :
      matches > 0 ? this.PARTIALLY_CORRECT_EMOJI
        : this.WRONG_EMOJI;
  }

  getName(card: CardData) {
    return getCardName(card, this.germanLanguage);
  }
}
