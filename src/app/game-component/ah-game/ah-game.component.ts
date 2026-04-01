import { Component } from '@angular/core';
import {GameComponent} from '../game.component';
import {FormsModule} from '@angular/forms';
import {NgbInputDatepicker} from '@ng-bootstrap/ng-bootstrap';
import {CustomDayComponent} from '../custom-day/custom-day.component';
import {NgComponentOutlet} from '@angular/common';
import {AhCardData} from '../../../model/ahCardData';
import {McCardData} from '../../../model/mcCardData';

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
export class AhGameComponent extends GameComponent<AhCardData, AhUserData> {
  // consts
  override MODE = "ah";
  override LOCAL_STORAGE_DATA_KEY = `${this.MODE}_data`;
  override LOCAL_STORAGE_SCHEMA_VERSION_KEY = `${this.MODE}_schema_version`;
  override LOCAL_STORAGE_HELP_KEY = `${this.MODE}_help_shown`;

  override cardInfoComponent = AhCardInfoComponent;
  override guessInfoComponent = AhGuessInfoComponent;

  override matchesFilter(card: AhCardData): boolean {
      return true; //TODO: filter
  }

  override getData() {
    return this.dataService.getAHData();
  }
}
