import { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Sender.css';

export function Sender({ readOnly, value, secret, socketId }) {
  const [ isSecret, setIsSecret ] = useState(true)
  const [ stateValue, setStateValue ] = useState('')
  const [ sent, setSent ] = useState(false)
  const [ copied, setCopied ] = useState(false)
  
  function send() {
    if (!stateValue) {
      return
    }

    setSent(true)

    fetch('/post', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'socket-id': socketId,
        'message': JSON.stringify({
          value: stateValue,
          secret: isSecret,
        }),
      }),
    })
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      send()
    }
  }

  useEffect(() => {

    if (readOnly) {
      setIsSecret(secret)
      setStateValue(value)
      setCopied(false)
    }

  }, [value, secret, readOnly])

  async function paste() {
    const text = await navigator.clipboard.readText();
    setStateValue(text)
  }

  async function copy() {
    await navigator.clipboard.writeText(stateValue);
    setCopied(true)
  }

  function open() {
    window.open(stateValue, '_blank')
  }

  function reset() {
    setSent(false)
  }

  if (copied) {
    return (
      <div className="Sender">
        Copied to the clipboard
      </div>
    )
  }

  if (sent) {
    return (
      <div className="Sender">
        <div className='message-sent'>
          Message sent
        </div>
        <div className='send-another'>
          <div className='button' onClick={reset}>Send another</div>
        </div>
      </div>
    )
  }

  return (
    <div className="Sender">
      <div className='wrapper'>
        <div className='input-wrapper'>
          <input type={ isSecret ? 'password' : 'text'} value={stateValue} readOnly={!!readOnly} onKeyDown={onKeyDown} onChange={(e) => setStateValue(e.target.value)}/>
          <div className='secret-button' onClick={() => setIsSecret(!isSecret)}>
            { isSecret ? <FaEyeSlash /> : <FaEye /> }
          </div>
        </div>
        <div className='button-container'>
          { !readOnly && !!navigator.clipboard && !!navigator.clipboard.readText && <div className='button' onClick={paste}>Paste</div> }
          { !readOnly && <div className='button' onClick={send}>Send</div> }
          { readOnly && !isSecret && stateValue.match(/^https?:\/\//) && <div className='button' onClick={open}>Open</div> }
          { readOnly && !!navigator.clipboard && !!navigator.clipboard.writeText && <div className='button' onClick={copy}>Copy</div> }
        </div>
      </div>
    </div>
  );
}
