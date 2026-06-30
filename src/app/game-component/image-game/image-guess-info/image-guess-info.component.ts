import {Component, computed, signal} from '@angular/core';
import {GuessInfoComponent} from '../../guess-info/guess-info.component';

@Component({
  selector: 'app-image-guess-info',
  imports: [],
  templateUrl: './image-guess-info.component.html',
  styleUrls: ['./image-guess-info.component.scss'],
})
export class ImageGuessInfoComponent extends GuessInfoComponent {
  override shouldShowPlaceholderImage = signal(false);
  zoom = computed(() => this.guesses().length);
}
