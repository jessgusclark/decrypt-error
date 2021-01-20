import React, { useState } from 'react'
import { encrypt as ethEncrypt } from 'eth-sig-util'
import Eth from 'ethjs-query'

function App() {
  const [address, setAddress] = useState(null)
  const [encryptedData, setEncryptedData] = useState([])
  const [decryptedData, setDecryptedData] = useState([])
  const [inputValue, setInputValue] = useState('')

  const handleConnect = () => {
    if (window.ethereum) {
      window.ethereum.enable();
      const eth = new Eth(window.ethereum);
      eth.accounts().then(accounts => setAddress(accounts[0]))
    }  
  }

  const decryptData = (hexCypher) =>
    window.ethereum.request({ method: 'eth_decrypt', params: [hexCypher, address] })
      .then(result => setDecryptedData(existing => [...existing, result]))

  const decryptAll = () => {
    setDecryptedData([])
    encryptedData.map(cypher => decryptData(cypher))
  }

  const encryptData = () =>
    window.ethereum.request({ method: 'eth_getEncryptionPublicKey', params: [address] })
      .then(publicKey => ethEncrypt(publicKey, { data: inputValue }, 'x25519-xsalsa20-poly1305'))
      .then(cipher => `0x${Buffer.from(JSON.stringify(cipher), 'utf8').toString('hex')}`)
      .then(result => {
        setEncryptedData(existing => [...existing, result])
        setInputValue('')
      })

  return (
    <div className="App">
      {!address && <button onClick={handleConnect}>Connect to Metamask</button>}

      {address && (
        <div>
          <p>Address: {address}</p>
          <hr/>

          <h2>Encrypt:</h2>
          <input type="text" value={inputValue} onChange={evt => setInputValue(evt.target.value)} />
          <button onClick={encryptData}>Encrypt String</button>
          <ol>
            {encryptedData.map(item => <li>{item}</li>)}
          </ol>

          <h2>Decrypt:</h2>
          <button onClick={decryptAll}>Decrypt All</button>
          <ol>
            {decryptedData.map(item => <li>{item}</li>)}
          </ol>
        </div>
      )}
    </div>
  );
}

export default App;
