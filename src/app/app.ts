import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgbCollapse} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgbCollapse],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  isMenuCollapsed = true;
}
