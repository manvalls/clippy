import './App.css';
import { Receiver } from './Receiver'
import { Sender } from './Sender'

function App() {
  const id = window.location.pathname.slice(1)
  return (
    id ? <Sender socketId={id} /> : <Receiver />
  );
}

export default App;
