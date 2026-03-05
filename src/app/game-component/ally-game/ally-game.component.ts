import {Component, computed} from '@angular/core';
import {GameComponent} from '../game.component';
import {FormsModule} from '@angular/forms';
import {NgbInputDatepicker} from '@ng-bootstrap/ng-bootstrap';
import {CustomDayComponent} from '../custom-day-component/custom-day.component';
import {CardData, CardType} from '../../../model/cardData';
import {map, Observable} from 'rxjs';
import {NgComponentOutlet} from '@angular/common';

@Component({
  selector: 'app-ally-game',
  imports: [
    FormsModule,
    NgbInputDatepicker,
    CustomDayComponent,
    NgComponentOutlet
  ],
  templateUrl: '../game.component.html',
  styleUrl: '../game.component.scss',
})
export class AllyGameComponent extends GameComponent {
  // consts
  override MODE = "ally";
  override LOCAL_STORAGE_DATA_KEY = `${this.MODE}_data`;
  override LOCAL_STORAGE_SCHEMA_VERSION_KEY = `${this.MODE}_schema_version`;
  override LOCAL_STORAGE_HELP_KEY = `${this.MODE}_help_shown`;

  // seed other than normal game as we operate on the same card pool
  override seed = computed(() => `${this.day()}-${this.MODE}`);

  // only get allies
  override getData(): Observable<CardData[]> {
    return super.getData().pipe(map(d => d.filter(c => c.type == CardType.Ally)));
  }
}
