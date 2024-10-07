import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {AppConfigService} from '../app.config.service';

@Injectable({
  providedIn: 'root'
})
export class BwilinkedmarketsService {

  constructor(private http: HttpClient) { }

  fetchMarkets(bets: any) {
   return this.http.get<any>(`${AppConfigService.settings.host}/fetch-linked-markets?gameid=`+bets[0].betTradingData.gameId+`&tradingpartition=`+bets[0].identifier.tradingPartition+`&gamename=`+bets[0].betTradingData.gameName+`&eventid=`+bets[0].betTradingData.eventId);
  }
}
