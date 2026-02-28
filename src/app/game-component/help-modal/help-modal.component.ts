import {Component, inject} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-help-modal',
  imports: [],
  templateUrl: './help-modal.component.html',
  styleUrl: './help-modal.component.scss',
})
export class HelpModalComponent {
  activeModal = inject(NgbActiveModal);
}
