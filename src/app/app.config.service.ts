import { Injectable } from '@angular/core';
import {IAppConfig} from './models/app-config.model';
import {JsonService} from './services/json.service';

@Injectable({
    providedIn: 'root'
})
export class AppConfigService {
    static settings: IAppConfig;

	constructor(private jsonService: JsonService) {
	}

  load() : Promise<IAppConfig> {
      return new Promise<IAppConfig>((resolve, reject) => {
        return this.jsonService.getConfigFile().subscribe((config) => {
            AppConfigService.settings = (config);
            resolve(AppConfigService.settings);
        });
      });
  }
}
