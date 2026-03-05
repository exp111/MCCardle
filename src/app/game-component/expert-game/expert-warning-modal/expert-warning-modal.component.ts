import {Component, inject} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-expert-warning-modal',
  imports: [],
  templateUrl: './expert-warning-modal.component.html',
  styleUrl: './expert-warning-modal.component.scss',
})
export class ExpertWarningModalComponent {
  activeModal = inject(NgbActiveModal);
}
