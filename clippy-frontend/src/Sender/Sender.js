import { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Sender.css';

export function Sender({ readOnly, value, secret, socketId }) {
  const [ isSecret, setIsSecret ] = useState(readOnly ? secret : true)
  const [ stateValue, setStateValue ] = useState(readOnly ? value : '')
  const [ sent, setSent ] = useState(false)
  const [ copied, setCopied ] = useState(false)
  
  function send() {
    if (!stateValue) {
      return
    }

    setSent(true)

    fetch('http://localhost:8090/post', {
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

  async function paste() {
    const text = await navigator.clipboard.readText();
    setStateValue(text)
  }

  async function copy() {
    await navigator.clipboard.writeText(stateValue);
    setCopied(true)
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
        Message sent
      </div>
    )
  }

  return (
    <div className="Sender">
      <div className='wrapper'>
        <div className='input-wrapper'>
          <input type={ isSecret ? 'password' : 'text'} value={stateValue} readOnly={!!readOnly} onChange={(e) => setStateValue(e.target.value)}/>
          <div className='secret-button' onClick={() => setIsSecret(!isSecret)}>
            { isSecret ? <FaEyeSlash /> : <FaEye /> }
          </div>
        </div>
        <div className='button-container'>
          { !readOnly && !!navigator.clipboard && !!navigator.clipboard.readText && <div className='button' onClick={paste}>Paste</div> }
          { !readOnly && <div className='button' onClick={send}>Send</div> }
          { readOnly && !!navigator.clipboard && !!navigator.clipboard.writeText && <div className='button' onClick={copy}>Copy</div> }
        </div>
      </div>
    </div>
  );
}
