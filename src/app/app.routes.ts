import { Routes } from '@angular/router';
import {CardsComponent} from './cards/cards.component';
import { GameComponent } from "./game-compoentn/game.component";

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
