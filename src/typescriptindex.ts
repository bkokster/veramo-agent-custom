// import express, { Request, Response, NextFunction } from 'express';

// import path from 'path'

// const app = express();
// const port = 3001;
// app.use(express.static(path.resolve(__dirname, '../typescriptclient/build')));

// interface LocationWithTimezone {
//     location: string;
//     timezoneName: string;
//     timezoneAbbr: string;
//     utcOffset: number;
//   };
      
// async function main(){

//   const getLocationsWithTimezones = (request: Request, response: Response, next: NextFunction) => {
//     let locations: LocationWithTimezone[] = [
//        {
//         location: 'Germany',
//         timezoneName: 'Central European Time',
//         timezoneAbbr: 'CET',
//         utcOffset: 1
//       },
//       {
//         location: 'China',
//         timezoneName: 'China Standard Time',
//         timezoneAbbr: 'CST',
//         utcOffset: 8
//       },
//       {
//         location: 'Argentina',
//         timezoneName: 'Argentina Time',
//         timezoneAbbr: 'ART',
//         utcOffset: -3
//       },
//       {
//         location: 'Japan',
//         timezoneName: 'Japan Standard Time',
//         timezoneAbbr: 'JST',
//         utcOffset: 9
//       }
//     ];
  
//     response.status(200).json(locations);
//   };
 
//   app.get("/api", (req, res) => {
//     res.json({ message: "Hello from server!" });
//   });

//   app.get('/timezones', getLocationsWithTimezones);

//   // All other GET requests not handled before will return our React app
//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '../typescriptclient/build', 'index.html'));
//   });

//   app.listen(port, () => {
//     console.log(`Timezones by location application is running on port ${port}.`);
//   });

// }

// main().catch(console.log)


import express from 'express';
import path from 'path';

// const PORT = process.env.PORT || 5000;
const PORT = 3001;

express()
  .use(express.static(path.join(__dirname, '../public')))
  // .set('views', path.join(__dirname, '../views'))
  // .set('view engine', 'ejs')
  .get("/api", (req, res) => {
        res.json({ message: "Hello from server!" });
      })
  .get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../typescriptclient/build', 'index.html'));
      })      
  // .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
