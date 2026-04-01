import {Component, computed} from '@angular/core';
import {GameComponent} from '../game.component';
import {getRandomItem} from '../../helpers';
import {FormsModule} from '@angular/forms';
import {CardInfoComponent} from '../card-info/card-info.component';
import {NgbInputDatepicker} from '@ng-bootstrap/ng-bootstrap';
import {CustomDayComponent} from '../custom-day/custom-day.component';
import {McCardData} from '../../../model/mcCardData';
import {ExpertWarningModalComponent} from './expert-warning-modal/expert-warning-modal.component';
import {NgComponentOutlet} from '@angular/common';
import {McGameComponent} from '../mc-game/mc-game.component';

@Component({
  selector: 'app-expert-game',
  imports: [
    FormsModule,
    NgbInputDatepicker,
    CustomDayComponent,
    NgComponentOutlet
  ],
  templateUrl: '../game.component.html',
  styleUrl: '../game.component.scss',
})
export class McExpertGameComponent extends McGameComponent {
  // consts
  override MODE = "expert";
  override LOCAL_STORAGE_DATA_KEY = `${this.MODE}_data`;
  override LOCAL_STORAGE_SCHEMA_VERSION_KEY = `${this.MODE}_schema_version`;
  override LOCAL_STORAGE_HELP_KEY = `${this.MODE}_help_shown`;

  // seed other than normal game as we operate on the same card pool
  override seed = computed(() => `${this.day()}-${this.MODE}`);
  // checks if the card was guessed (the card being the one randomized last guess)
  override cardGuessed = computed(() => this.guesses().includes(this.getCard(this.guesses().length - 1)));
  // overwrite card to change after every guess. if the card was guessed, instead of use the last card to properly show the end result
  override cardToGuess = computed(() => this.cardGuessed() ? this.getCard(this.guesses().length - 1) : this.getCard(this.guesses().length));

  // gets the random card for the seed randomized iterations times
  getCard(iteration: number): McCardData {
    if (!this.cards().length) {
      return null!;
    }
    return getRandomItem(this.cards(), this.seed(), iteration);
  }

  // reset filter after every guess
  override guessCard(cardData: McCardData) {
    super.guessCard(cardData);
    this.filter.set([]);
  }

  // show expert warning
  override showHelp() {
    this.modalService.open(ExpertWarningModalComponent, {size: "lg"});
  }
}
