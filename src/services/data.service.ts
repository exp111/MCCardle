import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CardData} from '../model/cardData';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  httpClient = inject(HttpClient);

  getData() {
    return this.httpClient.get<CardData[]>("cards.json");
  }
}
