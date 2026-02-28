import {Component, inject} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-expert-warning-modal',
  imports: [],
  templateUrl: './expert-warning-modal.html',
  styleUrl: './expert-warning-modal.scss',
})
export class ExpertWarningModal {
  activeModal = inject(NgbActiveModal);
}
