import {Routes} from '@angular/router';
import {CardsComponent} from './cards/cards.component';
import {GameComponent} from "./game-component/game.component";
import {ViewerComponent} from './viewer-component/viewer.component';
import {ExpertGameComponent} from './game-component/expert-game/expert-game.component';
import {AllyGameComponent} from './game-component/ally-game/ally-game.component';
import {ImageGameComponent} from './game-component/image-game/image-game.component';

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
    path: "expert",
    component: ExpertGameComponent
  },
  {
    path: "ally",
    component: AllyGameComponent
  },
  {
    path: "image",
    component: ImageGameComponent
  },
  {
    path: "**",
    component: GameComponent
  }
];
