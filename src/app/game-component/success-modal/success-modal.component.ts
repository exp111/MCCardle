import {Component, inject, Type} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {CardData, CardDataArrayField} from '../../../model/cardData';
import {CardInfoComponent} from '../card-info/card-info.component';
import {capitalize, getCardName, getShareLink} from '../../helpers';
import {ToastService} from '../../../services/toast.service';
import {GITHUB_PAGES_URL} from '../../const';
import {NgComponentOutlet} from '@angular/common';

@Component({
  selector: 'app-success-modal',
  imports: [
    NgComponentOutlet
  ],
  templateUrl: './success-modal.component.html',
  styleUrl: './success-modal.component.scss',
})
export class SuccessModalComponent {
  activeModal = inject(NgbActiveModal);
  toastService = inject(ToastService);

  cardInfoComponent!: Type<CardInfoComponent>;
  mode!: string;
  card!: CardData;
  germanLanguage!: boolean;
  guesses!: CardData[];
  day!: string;

  WRONG_EMOJI = "⬛";
  PARTIALLY_CORRECT_EMOJI = "🟨";
  CORRECT_EMOJI = "🟩";

  reset() {
    this.toastService.show({
      content: "Reset guesses."
    });
    this.activeModal.close("reset");
  }

  // configs for each game mode
  modeConfigs: Record<string, {legend: string, fields: (keyof CardData)[]}> = {
    "": {
      legend: "🗨️🪙👪🅰️🗓️💰📖🃏",
      fields: ["name", "cost", "type", "faction", "year", "resources", "packs", "traits"]
    },
    // same as standard
    "expert": {
      legend: "🗨️🪙👪🅰️🗓️💰📖🃏",
      fields: ["name", "cost", "type", "faction", "year", "resources", "packs", "traits"]
    },
    "ally": {
      legend: "🗨️🪙❤️🅰️🗓️🗡️🧠🃏",
      fields: ["name", "cost", "health", "faction", "year", "attack", "thwart", "traits"]
    }
  }

  share(addSpoileredCardName = false) {
    let share = "";
    if (this.mode) {
      share += `[${capitalize(this.mode)}] `;
    }
    share += `Marvel Champions Cardle ${this.day} in ${this.guesses.length} ${this.guesses.length == 1 ? "Guess" : "Guesses"}\n`;
    share += `${GITHUB_PAGES_URL}\n\n`;

    let config = this.modeConfigs[this.mode];
    if (!config) {
      console.error(`No config for mode ${this.mode} found. Defaulting to standard.`);
      config = this.modeConfigs[""];
    }

    // emoji legend
    share += `${config.legend}\n`;
    let tries: string[] = [];
    for (let guess of this.guesses) {
      let text = '';
      // iterate over fields and check each value
      for (let field of config.fields) {
        text += this.check(guess, field);
      }
      // add spoilered name at the end if wanted
      if (addSpoileredCardName) {
        text += ` ||${this.getName(guess)}||`;
      }
      tries.push(text);
    }
    share += tries.join("\n");
    if (addSpoileredCardName) {
      share += `\n||[View guesses](${getShareLink(this.day, this.card, this.guesses, this.germanLanguage, this.mode)})||`
    }
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

  check(guess: CardData, field: keyof CardData) {
    if (field == "name") {
      return this.checkName(guess);
    }

    if (Array.isArray(guess[field])) {
      return this.checkArray(guess, field as CardDataArrayField);
    }
    return this.checkValue(guess, field);
  }

  // return green if correct, yellow if first letter matches, wrong otherwise
  checkName(guess: CardData) {
    let cardName = this.getName(this.card);
    let guessName = this.getName(guess);
    return cardName == guessName ? this.CORRECT_EMOJI :
      cardName.startsWith(guessName[0]) ? this.PARTIALLY_CORRECT_EMOJI
      : this.WRONG_EMOJI;
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
