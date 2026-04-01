import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {DataService} from '../../../services/data.service';
import {McCardData} from '../../../model/mcCardData';
import {AbstractCardsComponent} from '../cards.component';

@Component({
  selector: 'app-mc-cards',
  imports: [],
  templateUrl: './mc-cards.component.html'
})
export class McCardsComponent extends AbstractCardsComponent<McCardData> {
  override getData() {
    return this.dataService.getMCData();
  }
}
