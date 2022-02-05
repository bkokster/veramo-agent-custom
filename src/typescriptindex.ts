import express, { Request, Response, NextFunction } from 'express';
import path from 'path'
import { agent } from '../src/veramo/setup'

const app = express();
const PORT = process.env.PORT || 3001
app.use(express.static(path.resolve(__dirname, '../typescriptclient/build')));

interface LocationWithTimezone {
    location: string;
    timezoneName: string;
    timezoneAbbr: string;
    utcOffset: number;
  };
      
async function main(){
  
  const identifiers = await agent.didManagerFind();

  const getLocationsWithTimezones = (request: Request, response: Response, next: NextFunction) => {
    let locations: LocationWithTimezone[] = [
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
 
  app.get("/api", (req, res) => {
    res.json({ message: 'Hey hey hey' });
  });

  app.get('/timezones', getLocationsWithTimezones);

  // All other GET requests not handled before will return our React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../typescriptclient/build', 'index.html'));
  });

  app.listen(PORT, () => {
    console.log(`Timezones by location application is running on port ${PORT}.`);
  });

}

main().catch(console.log)


// import express from 'express';
// import path from 'path';

// const PORT = process.env.PORT || 3001

// express()
//   .use(express.static(path.join(__dirname, '../typescriptclient/build')))
//   // .set('views', path.join(__dirname, '../views'))
//   // .set('view engine', 'ejs')
//   .get("/api", (req, res) => {
//         res.json({ message: "Hello from server updated!" });
//       })
//   .get('*', (req, res) => {
//         res.sendFile(path.resolve(__dirname, '../typescriptclient/build', 'index.html'));
//       })      
//   // .get('/', (req, res) => res.render('pages/index'))
//   .listen(PORT, () => console.log(`Listening on ${PORT}`));
