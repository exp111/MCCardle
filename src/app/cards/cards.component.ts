import {ChangeDetectorRef, Component, inject, OnInit} from '@angular/core';
import {DataService} from '../../services/data.service';
import {Observable} from 'rxjs';
import {CardData} from '../../model/cardData';

@Component({template: ""})
export abstract class AbstractCardsComponent<T extends CardData> implements OnInit {
  dataService = inject(DataService);
  cdr = inject(ChangeDetectorRef);

  cards: T[] = [];
  loading = false;

  ngOnInit() {
    this.loading = true;
    this.getData().subscribe({
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

  abstract getData(): Observable<T[]>;
}
