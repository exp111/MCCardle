import { Component } from '@angular/core';
import {CardInfoComponent} from '../../card-info/card-info.component';
import {CardInfoAttribute} from '../../card-info/card-info-attribute/card-info-attribute.component';
import {NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'app-ally-card-info',
  imports: [
    CardInfoAttribute,
    NgTemplateOutlet
  ],
  templateUrl: './ally-card-info.component.html',
  styleUrl: '../../card-info/card-info.component.scss',
})
export class AllyCardInfoComponent extends CardInfoComponent {

}
