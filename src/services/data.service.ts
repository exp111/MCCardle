import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  httpClient = inject(HttpClient);

  getData() {
    return this.httpClient.get<CardData[]>("cards.json");
  }
}
