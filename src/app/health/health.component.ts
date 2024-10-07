import { Component, OnInit, ElementRef } from '@angular/core';
import { HealthService } from '../services/health.service';
import { IdentityHealthService } from '../services/identity.health.service';
import {AppConfigService} from '../app.config.service';
import {formatDate } from '@angular/common';
import {forkJoin} from 'rxjs';
import { Constants } from '../shared/constants';

declare var require: any
const xml2js = require("xml2js");


@Component({
  selector: 'app-health',
  templateUrl: './health.component.html'
  })
export class HealthComponent implements OnInit {

  response : Object;
  today= new Date();
  overallHealthCheck = "CHECK_ERROR";
  bctServiceHealthStatus : string;
  appVersion = `${AppConfigService.settings.version}`;
  hostURL = `${AppConfigService.settings.host}`;
  bctServiceHealthDetails : Object;

  constructor(private healthService : HealthService){
  }

  getHealthStatus(response: any){
       const parser = new xml2js.Parser({ explicitArray: false });
       return parser.parseStringPromise(response, {explicitArray: false})
              .then((result : any) => {
              return JSON.parse(JSON.stringify(result)).healthstatus.overall;
            })
            .catch(function(err:any) {
              console.log(err);
            });
  }


  ngOnInit(){
    forkJoin([
        this.bctServiceHealthDetails = this.healthService.health(),
        this.bctServiceHealthStatus = this.getHealthStatus(this.bctServiceHealthDetails)
    ]).subscribe(res => {
      this.bctServiceHealthStatus = res[0];
    forkJoin([
      this.bctServiceHealthStatus = this.getHealthStatus(res[0])
    ]).subscribe((res2 : string[]) => {

      var bctservice = res2[0];
      this.overallHealthCheck = res2.includes("CHECK_ERROR") ? "CHECK_ERROR" : (res2.includes("CHECK_OK") ? "CHECK_OK" : "CHECK_ERROR");

      var jstoday = formatDate(this.today, 'dd-MM-yyyy hh:mm:ss a', 'en-US', '+0530');
      var placeDetail = {
           "healthstatus": {
                "application": {
                  "_name": "bct-ui",
                  "_version": this.appVersion,
                  "_hostname": window.location.hostname
                },
                "overall": this.overallHealthCheck,
                "details": {
                  "technical": [
                    {
                      "description": "Fails if health check returns ERROR or health page is not reachable",
                      "connectionString": this.hostURL+"/diagnostics/health",
                      "_id": "bct-service",
                      "_dependency": "EXTERNAL",
                      "_dependencyName": "bct-service",
                      "_essential": "true",
                      "_status": bctservice
                    }
                  ]
                },
                "_generated": jstoday
              }
            };
    (<HTMLInputElement>document.getElementById("json-result")).innerHTML = JSON.stringify(placeDetail, undefined, 2);
    });
    });


  }

}
