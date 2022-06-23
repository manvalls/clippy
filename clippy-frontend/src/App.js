import { useEffect, useState } from 'react';
import './App.css';
import { Receiver } from './Receiver'
import { Sender } from './Sender'

function App() {
  const [hash, setHash] = useState(window.location.hash)

  useEffect(() => {
    window.onhashchange = () => {
      setHash(window.location.hash)
    }
  }, [])

  return (
    hash ? <Sender socketId={window.location.hash.slice(1)} /> : <Receiver />
  );
}

export default App;
