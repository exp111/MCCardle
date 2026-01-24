import {Routes} from '@angular/router';
import {CardsComponent} from './cards/cards.component';
import {GameComponent} from "./game-component/game.component";

export const routes: Routes = [
  {
    path: "cards",
    component: CardsComponent
  },
  {
    path: "**",
    component: GameComponent
  }
];
