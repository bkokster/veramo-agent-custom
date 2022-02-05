import React, { useEffect, useState } from 'react'
import './App.css'

// import { agent } from '../../src/veramo/setup'

function App() {


  // const [didDoc, setDidDoc] = useState<any>()

  // const resolve = async () => {
  //   const doc = await agent.resolveDid({
  //     didUrl: 'did:ethr:rinkeby:0x6acf3bb1ef0ee84559de2bc2bd9d91532062a730',
  //   })

  //   setDidDoc(doc)
  // }

  // useEffect(() => {
  //   resolve()
  // }, [])

  // return (
  //   <div className="App">
  //     <header className="App-header">
  //       <p> Typescript React App Working </p>
  //     </header>
  //   </div>
  // )
  // {"message":"Hello from server!"}

const [data, setData] = React.useState(null);

React.useEffect(() => {
  fetch("/api")
    .then((res) => res.json())
    .then((data) => setData(data.message));
}, []);

return (
  <div className="App">
    <header className="App-header">
      <p>{!data ? "Loading..." : data}</p>
    </header>
  </div>
);

// return (
//   <div className="App">
//     <header className="App-header">
//       <p>Hallo</p>
//     </header>
//   </div>
// );

}

export default App