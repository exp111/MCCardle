import {Routes} from '@angular/router';
import {CardsComponent} from './cards/cards.component';
import {GameComponent} from "./game-component/game.component";
import {ViewerComponent} from './viewer-component/viewer.component';

export const routes: Routes = [
  {
    path: "cards",
    component: CardsComponent
  },
  {
    path: "viewer",
    component: ViewerComponent
  },
  {
    path: "**",
    component: GameComponent
  }
];
