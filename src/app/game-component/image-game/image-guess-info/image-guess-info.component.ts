import {Component, computed, signal} from '@angular/core';
import {GuessInfoComponent} from '../../guess-info/guess-info.component';

@Component({
  selector: 'app-image-guess-info',
  imports: [],
  templateUrl: './image-guess-info.component.html',
  styleUrls: ['./image-guess-info.component.scss'],
})
export class ImageGuessInfoComponent extends GuessInfoComponent {
  MAX_ZOOM = 5;

  override shouldShowPlaceholderImage = signal(false);
  zoom = computed(() => this.MAX_ZOOM + 1 - Math.min(Math.max(this.guesses().length + 1, 1), this.MAX_ZOOM));
}
