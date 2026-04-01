import {inject, Type} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {CardInfoComponent} from '../card-info/card-info.component';
import {capitalize, getCardName, getShareLink} from '../../helpers';
import {ToastService} from '../../../services/toast.service';
import {GITHUB_PAGES_URL} from '../../const';
import {CardData} from '../../../model/cardData';

export abstract class SuccessModalComponent<T extends CardData, A> {
  activeModal = inject(NgbActiveModal);
  toastService = inject(ToastService);

  cardInfoComponent!: Type<CardInfoComponent>;
  mode!: string;
  card!: T;
  germanLanguage!: boolean;
  guesses!: T[];
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
  abstract modeConfigs: Record<string, {legend: string, fields: (keyof T)[]}>;

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

  check(guess: T, field: keyof T) {
    if (field == "name") {
      return this.checkName(guess);
    }

    if (Array.isArray(guess[field])) {
      return this.checkArray(guess, field as A);
    }
    return this.checkValue(guess, field);
  }

  // return green if correct, yellow if first letter matches, wrong otherwise
  checkName(guess: T) {
    let cardName = this.getName(this.card);
    let guessName = this.getName(guess);
    return cardName == guessName ? this.CORRECT_EMOJI :
      cardName.startsWith(guessName[0]) ? this.PARTIALLY_CORRECT_EMOJI
      : this.WRONG_EMOJI;
  }

  checkValue(guess: T, field: keyof T) {
    return this.card[field] == guess[field] ? this.CORRECT_EMOJI : this.WRONG_EMOJI;
  }

  checkArray(guess: T, field: A) {
    let correctArray = (this.card as any)[field];
    let guessArray = (guess as any)[field];
    let matches = guessArray.filter((v: any) => correctArray.includes(v as never)).length;
    // if arrays completely match, return green. if partially matched, return orange. otherwise wrong
    return matches == correctArray.length && matches == guessArray.length ? this.CORRECT_EMOJI :
      matches > 0 ? this.PARTIALLY_CORRECT_EMOJI
        : this.WRONG_EMOJI;
  }

  getName(card: T) {
    return getCardName(card, this.germanLanguage);
  }
}
