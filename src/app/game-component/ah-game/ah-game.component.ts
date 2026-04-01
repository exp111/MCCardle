import {Component} from '@angular/core';
import {GameComponent} from '../game.component';
import {FormsModule} from '@angular/forms';
import {NgbInputDatepicker} from '@ng-bootstrap/ng-bootstrap';
import {CustomDayComponent} from '../custom-day/custom-day.component';
import {NgComponentOutlet} from '@angular/common';
import {AhCardData} from '../../../model/ahCardData';
import {AhCardInfoComponent} from './ah-card-info/ah-card-info.component';
import {AhGuessInfoComponent} from './ah-guess-info/ah-guess-info.component';
import {AhSuccessModalComponent} from '../success-modal/ah-success-modal.component';
import {McCardData} from '../../../model/mcCardData';
import {getAhCardImage, getAhFaction} from '../../helpers';

export interface AhUserData {
  card: AhCardData;
  guesses: AhCardData[];
}

@Component({
  selector: 'app-ah-game',
  imports: [
    FormsModule,
    NgbInputDatepicker,
    CustomDayComponent,
    NgComponentOutlet
  ],
  templateUrl: '../game.component.html',
  styleUrl: '../game.component.scss'
})
export class AhGameComponent extends GameComponent<AhCardData> {
  // consts
  override MODE = "ah";
  override LOCAL_STORAGE_DATA_KEY = `${this.MODE}_data`;
  override LOCAL_STORAGE_SCHEMA_VERSION_KEY = `${this.MODE}_schema_version`;
  override LOCAL_STORAGE_HELP_KEY = `${this.MODE}_help_shown`;

  //TODO: fix these components
  override cardInfoComponent = AhCardInfoComponent;
  override guessInfoComponent = AhGuessInfoComponent;
  override successModalType = AhSuccessModalComponent;

  override matchesFilter(card: AhCardData): boolean {
      return true; //TODO: filter
  }

  override getFaction(card: AhCardData) {
    return getAhFaction(card.faction);
  }

  override getCardImage(card: AhCardData): string {
    return getAhCardImage(card);
  }

  override getData() {
    return this.dataService.getAHData();
  }
}
