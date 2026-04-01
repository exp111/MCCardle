import { Component } from '@angular/core';
import {GuessInfoComponent} from '../../guess-info/guess-info.component';
import {GuessInfoAttributeComponent} from '../../guess-info/guess-info-attribute/guess-info-attribute.component';

@Component({
  selector: 'app-ah-guess-info',
  imports: [
    GuessInfoAttributeComponent
  ],
  templateUrl: './ah-guess-info.component.html',
  styleUrls: ['../../card-info/card-info.component.scss', '../../guess-info/guess-info.component.scss'],
})
export class AhGuessInfoComponent extends GuessInfoComponent {

}
