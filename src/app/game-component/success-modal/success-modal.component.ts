import {Component, inject} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {CardData} from '../../../model/cardData';
import {CardInfoComponent} from '../card-info-component/card-info.component';

@Component({
  selector: 'app-success-modal',
  imports: [
    CardInfoComponent
  ],
  templateUrl: './success-modal.component.html',
  styleUrl: './success-modal.component.scss',
})
export class SuccessModalComponent {
  activeModal = inject(NgbActiveModal);

  card!: CardData;
  germanLanguage!: boolean;
}
