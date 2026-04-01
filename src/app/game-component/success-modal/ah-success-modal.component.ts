import {SuccessModalComponent} from './success-modal.component';
import {McCardData, McCardDataArrayField} from '../../../model/mcCardData';
import {Component} from '@angular/core';
import {NgComponentOutlet} from '@angular/common';
import {AhCardData, AhCardDataArrayField} from '../../../model/ahCardData';

@Component({
  selector: 'app-ah-success-modal',
  imports: [
    NgComponentOutlet
  ],
  templateUrl: './success-modal.component.html',
})
export class AhSuccessModalComponent extends SuccessModalComponent<AhCardData, AhCardDataArrayField>{
  override modeConfigs: Record<string, { legend: string; fields: (keyof AhCardData)[]; }> = {
    "ah": {
      legend: "🗨️🪙👪🅰️🗓️X💰📖🃏",
      fields: ["name", "cost", "type", "faction", "year", "xp", "skills", "packs", "traits"]
    },
  }
}
