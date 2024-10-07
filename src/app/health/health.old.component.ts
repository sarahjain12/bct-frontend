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
  selector: 'app-health-old',
  templateUrl: './health-old.component.html'
  })
export class HealthComponent implements OnInit {

  response : Object;
  today= new Date();
  overallHealthCheck = "CHECK_ERROR";
  identityHealthStatus : string;
  bctServiceHealthStatus : string;
  appVersion = `${AppConfigService.settings.version}`;
  hostURL = `${AppConfigService.settings.host}`;
  env = `${AppConfigService.settings.env}`;
  IdentityServiceHealthDetails : Object;
  bctServiceHealthDetails : Object;
  identityHealthURL = this.getIdentityURL()+"/health.aspx";

  constructor(private healthService : HealthService, private identityService : IdentityHealthService){
  }

  getHealthStatus(response: any, dependencyName : string){
       const parser = new xml2js.Parser({ explicitArray: false });
       return parser.parseStringPromise(response, {explicitArray: false})
              .then((result : any) => {
              var x  = "";
              if(dependencyName == "bctService"){
                  x = JSON.parse(JSON.stringify(result)).healthstatus.overall;
              }
              else{
                  x = JSON.parse(JSON.stringify(result)).health.overall;
              }
              return x;
            })
            .catch(function(err:any) {
              console.log(err);
            });
  }

    private getIdentityURL() : string{
      switch(this.env){
        case "dev" :
         return  Constants.devIdpAuthority;
        case "test" :
          return Constants.testIdpAuthority;
        case "prod" :
          return Constants.prodIdpAuthority;
        default :
          return Constants.devIdpAuthority;;
      }
    }


  ngOnInit(){
  forkJoin([
        this.bctServiceHealthDetails = this.healthService.health(),
        this.IdentityServiceHealthDetails = this.identityService.health(this.identityHealthURL)
  ]).subscribe(res => {
      this.bctServiceHealthStatus = res[0];
      this.identityHealthStatus = res[1];
    forkJoin([
      this.bctServiceHealthStatus = this.getHealthStatus(res[0], "bctService"),
     this.identityHealthStatus = this.getHealthStatus(res[1], "identity")
    ]).subscribe((res2 : string[]) => {
      var bctservice = res2[0];
      var identity = res2[1];
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
                      "connectionString": this.identityHealthURL,
                      "_id": "identity",
                      "_dependency": "EXTERNAL",
                      "_dependencyName": "identity",
                      "_essential": "true",
                      "_status": identity
                    },
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
