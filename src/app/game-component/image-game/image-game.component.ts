import {Component, computed, signal} from '@angular/core';
import {GameComponent} from '../game.component';
import {FormsModule} from '@angular/forms';
import {NgbInputDatepicker} from '@ng-bootstrap/ng-bootstrap';
import {CustomDayComponent} from '../custom-day/custom-day.component';
import {NgComponentOutlet} from '@angular/common';
import {ImageGuessInfoComponent} from './image-guess-info/image-guess-info.component';
import {ImageCardInfoComponent} from './image-card-info/image-card-info.component';

@Component({
  selector: 'app-image-game',
  imports: [
    FormsModule,
    NgbInputDatepicker,
    CustomDayComponent,
    NgComponentOutlet
  ],
  templateUrl: '../game.component.html',
  styleUrl: '../game.component.scss',
})
export class ImageGameComponent extends GameComponent {
  // consts
  override MODE = "image";
  override LOCAL_STORAGE_DATA_KEY = `${this.MODE}_data`;
  override LOCAL_STORAGE_SCHEMA_VERSION_KEY = `${this.MODE}_schema_version`;
  override LOCAL_STORAGE_HELP_KEY = `${this.MODE}_help_shown`;
  override SHOULD_SHOW_IMAGES = false;

  // dont show images
  override showSearchImages = signal(false);
  // seed other than normal game as we operate on the same card pool
  override seed = computed(() => `${this.day()}-${this.MODE}`);

  override cardInfoComponent = ImageCardInfoComponent;
  // the image
  override guessInfoComponent = ImageGuessInfoComponent;
}
