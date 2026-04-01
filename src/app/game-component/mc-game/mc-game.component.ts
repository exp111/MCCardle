import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgbInputDatepicker} from '@ng-bootstrap/ng-bootstrap';
import {CustomDayComponent} from '../custom-day/custom-day.component';
import {NgComponentOutlet} from '@angular/common';
import {GameComponent} from '../game.component';
import {McCardData, McCardDataArrayField, McCardResource} from '../../../model/mcCardData';
import {arraysHaveSameValues, getMcCardImage, getMcFaction, sortString} from '../../helpers';
import {McSuccessModalComponent} from '../success-modal/mc-success-modal.component';

export interface McUserData {
  card: McCardData;
  guesses: McCardData[];
}

@Component({
  selector: 'app-game',
  imports: [
    FormsModule,
    NgbInputDatepicker,
    CustomDayComponent,
    NgComponentOutlet
  ],
  templateUrl: '../game.component.html',
  styleUrl: '../game.component.scss',
})
export class McGameComponent extends GameComponent<McCardData> {
  override successModalType = McSuccessModalComponent;

  override matchesFilter(card: McCardData) {
    let filter = this.filter();
    if (!filter?.length) {
      return true;
    }

    for (let criterium of filter) {
      // for arrays check if the value is contained in the array
      if (criterium.array) {
        if (!(card[criterium.filter as McCardDataArrayField] as any[]).includes(criterium.value)) {
          return false;
        }
        continue;
      }

      // custom filters
      switch (criterium.filter) {
        case 'firstLetter':
          if (this.getName(card)[0] != criterium.value) {
            return false;
          }
          break;
        case 'allResources':
          if (sortString(card.resources.join("")) != criterium.value) {
            return false;
          }
          break;
        case 'anyResource':
          if (!criterium.value.every((r: McCardResource) => card.resources.includes(r))) {
            return false;
          }
          break;
        case 'allPacks':
          if (!arraysHaveSameValues(card.packs, criterium.value)) {
            return false;
          }
          break;
        case 'allTraits':
          if (!arraysHaveSameValues(card.traits, criterium.value)) {
            return false;
          }
          break;
        case 'anyTrait':
          if (!criterium.value.every((t: string) => card.traits.includes(t))) {
            return false;
          }
          break;
        default:
          // default: just check if the field equals the value
          if (card[criterium.filter] != criterium.value) {
            return false;
          }
          break;
      }
    }
    return true;
  }

  override getFaction(card: McCardData) {
    return getMcFaction(card.faction);
  }

  override getCardImage(card: McCardData): string {
    return getMcCardImage(card);
  }

  override getData() {
    return this.dataService.getMCData();
  }
}
