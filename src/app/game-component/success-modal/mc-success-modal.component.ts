import {SuccessModalComponent} from './success-modal.component';
import {McCardData, McCardDataArrayField} from '../../../model/mcCardData';
import {Component} from '@angular/core';
import {NgComponentOutlet} from '@angular/common';

@Component({
  selector: 'app-mc-success-modal',
  imports: [
    NgComponentOutlet
  ],
  templateUrl: './success-modal.component.html',
})
export class McSuccessModalComponent extends SuccessModalComponent<McCardData, McCardDataArrayField>{
  override modeConfigs: Record<string, { legend: string; fields: (keyof McCardData)[]; }> = {
    "": {
      legend: "🗨️🪙👪🅰️🗓️💰📖🃏",
      fields: ["name", "cost", "type", "faction", "year", "resources", "packs", "traits"]
    },
    // same as standard
    "expert": {
      legend: "🗨️🪙👪🅰️🗓️💰📖🃏",
      fields: ["name", "cost", "type", "faction", "year", "resources", "packs", "traits"]
    },
    "ally": {
      legend: "🗨️🪙❤️🅰️🗓️🗡️🧠🃏",
      fields: ["name", "cost", "health", "faction", "year", "attack", "thwart", "traits"]
    }
  }
}
