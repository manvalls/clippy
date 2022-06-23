import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import { Sender } from '../Sender'
import './Receiver.css';

export function Receiver() {
  const [id, setId] = useState()
  const [data, setData] = useState()

  useEffect(() => {
    const ws = new WebSocket('/socket')

    const onData = (e) => {
      setData(JSON.parse(e.data))
    }

    const onId = (e) => {
      setId(e.data)
      ws.onmessage = onData
    }

    ws.onmessage = onId

    return () => {
      ws.close()
    }
  }, [])

  if (data) {
    return <Sender readOnly value={data.value} secret={data.secret} />
  }

  return (
    <div className="Receiver">
      { !!id && (
        <>
          <QRCode value={`${window.location.origin}/#${id}`} />
          <div className='url'>
            { `${window.location.host}/#${id}` }
          </div>
        </>
      ) }
      { !id && 'Loading...' }
    </div>
  );
}
