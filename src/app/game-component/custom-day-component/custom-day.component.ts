import {Component, computed, input, ViewEncapsulation} from '@angular/core';
import {NgbDate} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: '[customDay]',
  imports: [],
  templateUrl: './custom-day.component.html',
  styleUrl: './custom-day.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'btn-light',
    '[class.bg-primary]': 'selected()',
    '[class.text-white]': 'selected()',
    '[class.text-muted]': 'isMuted()',
    '[class.outside]': 'isMuted()',
    '[class.active]': 'focused()',
    '[class.guessed]': 'dayGuessed()'
  },
})
export class CustomDayComponent {
  dayGuessed = input.required<boolean>();
  currentMonth = input.required<number>();
  date = input.required<NgbDate>();
  disabled = input.required<boolean>();
  focused = input.required<boolean>();
  selected = input.required<boolean>();
  isMuted = computed(() =>
    !this.selected() && (this.date().month !== this.currentMonth() || this.disabled()))
}
