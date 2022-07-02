import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import GitHubButton from 'react-github-btn'
import { Sender } from '../Sender'
import './Receiver.css';

export function Receiver() {
  const [id, setId] = useState()
  const [data, setData] = useState()
  const [origin, setOrigin] = useState(window.location.origin)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const ws = new WebSocket(window.location.origin.replace('http', 'ws') + '/socket')
    let nextRetryCount = retryCount + 1

    const onData = (e) => {
      setData(JSON.parse(e.data))
    }

    const onOrigin = (e) => {
      if (e.data) {
        setOrigin(e.data)
      }

      ws.onmessage = onData
    }

    const onId = (e) => {
      nextRetryCount = retryCount === 0 ? 1 : 0
      setId(e.data)
      ws.onmessage = onOrigin
    }

    ws.onmessage = onId

    let timeout
    ws.onerror = ws.onclose = () => {
      timeout = setTimeout(() => {
        setRetryCount(nextRetryCount)
      }, retryCount * 100)
    }

    return () => {
      ws.onerror = ws.onclose = null
      clearTimeout(timeout)
      ws.close()
    }
  }, [retryCount])

  if (data) {
    return <Sender readOnly value={data.value} secret={data.secret} />
  }

  return (
    <div className="Receiver">
      { !!id && (
        <>
          <QRCode value={`${origin}/${id}`} />
          <div className='url'>
            { `${origin.replace(/^https?:\/\//, '')}/${id}` }
          </div>
          <div className='github'>
            <GitHubButton href="https://github.com/manvalls/clippy" data-size="large" aria-label="View manvalls/clippy on GitHub">View on GitHub</GitHubButton>
          </div>
        </>
      ) }
      { !id && 'Loading...' }
    </div>
  );
}
