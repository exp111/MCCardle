import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {CardData} from '../../model/cardData';

@Component({
  selector: 'app-cards',
  imports: [],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.scss',
})
export class CardsComponent implements OnInit {
  dataService = inject(DataService);
  cdr = inject(ChangeDetectorRef);

  cards: CardData[] = [];
  loading = false;

  ngOnInit() {
    this.loading = true;
    this.dataService.getData().subscribe({
      next: data => {
        this.cards = data.sort((a, b) => a.code.localeCompare(b.code));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    })
  }
}
