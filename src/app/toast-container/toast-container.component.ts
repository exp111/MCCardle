import {Component, inject} from '@angular/core';
import {ToastService} from '../../services/toast.service';
import {NgbToast} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-toast-container',
  imports: [NgbToast],
  templateUrl: "toast-container.component.html",
  host: { class: 'toast-container position-fixed top-0 end-0 p-3', style: 'z-index: 1200' },
})
export class ToastContainerComponent {
  protected toastService = inject(ToastService);
}
