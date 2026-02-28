import {Component, computed} from '@angular/core';
import {GameComponent} from '../game.component';
import {getRandomItem} from '../../helpers';
import {FormsModule} from '@angular/forms';
import {CardInfoComponent} from '../card-info/card-info.component';
import {GuessInfoComponent} from '../guess-info/guess-info.component';
import {NgbInputDatepicker} from '@ng-bootstrap/ng-bootstrap';
import {CustomDayComponent} from '../custom-day-component/custom-day.component';
import {CardData} from '../../../model/cardData';
import {ExpertWarningModal} from './expert-warning-modal/expert-warning-modal';

@Component({
  selector: 'app-expert-game',
  imports: [
    FormsModule,
    CardInfoComponent,
    GuessInfoComponent,
    NgbInputDatepicker,
    CustomDayComponent
  ],
  templateUrl: '../game.component.html',
  styleUrl: '../game.component.scss',
})
export class ExpertGameComponent extends GameComponent {
  // consts
  override MODE = "Expert";
  override LOCAL_STORAGE_DATA_KEY = "expert_data";
  override LOCAL_STORAGE_SCHEMA_VERSION_KEY = "expert_schema_version";

  // seed other than normal game as we operate on the same card pool
  override seed = computed(() => `${this.day()}-expert`);
  // checks if the card was guessed (the card being the one randomized last guess)
  override cardGuessed = computed(() => this.guesses().includes(this.getCard(this.guesses().length - 1)));
  // overwrite card to change after every guess. if the card was guessed, instead of use the last card to properly show the end result
  override cardToGuess = computed(() => this.cardGuessed() ? this.getCard(this.guesses().length - 1) : this.getCard(this.guesses().length));

  override ngOnInit() {
    super.ngOnInit();
    this.modalService.open(ExpertWarningModal, {size: "lg"});
  }

  // gets the random card for the seed randomized iterations times
  getCard(iteration: number) {
    if (!this.cards().length) {
      return null!;
    }
    return getRandomItem(this.cards(), this.seed(), iteration);
  }

  // reset filter after every guess
  override guessCard(cardData: CardData) {
    super.guessCard(cardData);
    this.filter.set([]);
  }
}
