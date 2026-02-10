import {Component, computed, effect, signal} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NgbCollapse} from '@ng-bootstrap/ng-bootstrap';
import {ToastContainerComponent} from './toast-container/toast-container.component';
import {GITHUB_URL, KOFI_URL} from './const';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgbCollapse, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  PREFERS_DARK_QUERY = "(prefers-color-scheme: dark)";

  isMenuCollapsed = signal(true);
  darkMode = signal(window.matchMedia(this.PREFERS_DARK_QUERY).matches);
  theme = computed(() => this.darkMode() ? "dark" : "light");

  constructor() {
    // write theme to html tag
    effect(() => document.documentElement.setAttribute('data-bs-theme', this.theme()));
    // listen to system
    window.matchMedia(this.PREFERS_DARK_QUERY).addEventListener('change', (event) =>
      this.darkMode.set(event.matches),
    );
  }

  toggleMenuCollapsed() {
    this.isMenuCollapsed.update(c => !c)
  }

  toggleDarkMode() {
    this.darkMode.update(d => !d);
  }

  protected readonly GITHUB_URL = GITHUB_URL;
  protected readonly KOFI_URL = KOFI_URL;
}
