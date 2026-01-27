import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgbCollapse} from '@ng-bootstrap/ng-bootstrap';
import {ToastContainerComponent} from './toast-container/toast-container.component';
import {GITHUB_URL} from './const';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgbCollapse, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  isMenuCollapsed = true;
  protected readonly GITHUB_URL = GITHUB_URL;
}
