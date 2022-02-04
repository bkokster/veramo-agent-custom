import express, { Request, Response, NextFunction } from 'express';
import { agent } from './veramo/setup';
import {createDefaultDid, CreateDefaultDidOptions} from './custom-functions'
import path from 'path'

const app = express();
const port = 3001;
app.use(express.static(path.resolve(__dirname, '../typescriptclient/build')));

interface LocationWithTimezone {
    location: string;
    timezoneName: string;
    timezoneAbbr: string;
    utcOffset: number;
  };
      
async function main(){

  // const didOptions: CreateDefaultDidOptions = {

    //     agent: agent,
    //     baseUrl : 'trustfront.herokuapp.com'

    // }
    // createDefaultDid(didOptions);

  // const did = await agent.didManagerGetByAlias({alias:'trustfront.herokuapp.com'})
  // const did = await agent.didManagerGetOrCreate({'alias':'secondkey'});

  app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
  });
  
  const getLocationsWithTimezones = (request: Request, response: Response, next: NextFunction) => {
    let locations: LocationWithTimezone[] = [
      // {
      //   location: 'Germany',
      //   timezoneName: did.did,
      //   timezoneAbbr: 'CET',
      //   utcOffset: 1
      // },
      {
        location: 'Germany',
        timezoneName: 'Central European Time',
        timezoneAbbr: 'CET',
        utcOffset: 1
      },
      {
        location: 'China',
        timezoneName: 'China Standard Time',
        timezoneAbbr: 'CST',
        utcOffset: 8
      },
      {
        location: 'Argentina',
        timezoneName: 'Argentina Time',
        timezoneAbbr: 'ART',
        utcOffset: -3
      },
      {
        location: 'Japan',
        timezoneName: 'Japan Standard Time',
        timezoneAbbr: 'JST',
        utcOffset: 9
      }
    ];
  
    response.status(200).json(locations);
  };
 
  app.get('/timezones', getLocationsWithTimezones);

  app.listen(port, () => {
    console.log(`Timezones by location application is running on port ${port}.`);
  });

}

main().catch(console.log)