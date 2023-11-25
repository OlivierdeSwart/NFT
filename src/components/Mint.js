import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';

const Mint = ({ provider, nft, cost, setIsLoading }) => {
  const [isWaiting, setIsWaiting] = useState(false)
  const [amount, setAmount] = useState(1)

  const mintHandler = async (e) => {
    e.preventDefault()
    setIsWaiting(true)

    try {
      const signer = await provider.getSigner()
      const transaction = await nft.connect(signer).mint(amount, { value: cost })
      await transaction.wait()
    } catch (error) {
    console.error('Error:', error); // Log the error for debugging purposes
    window.alert('User rejected or transaction reverted2');
    // console.log(await nft.connect(signer).mint(amount, { value: cost }));
  }

    setIsLoading(true)
  }

  return(
    <Form onSubmit={mintHandler} style={{ maxWidth: '450px', margin: '50px auto' }}>
      {isWaiting ? (
        <Spinner animation="border" style={{ display: 'block', margin: '0 auto' }} />
      ) : (
        <Form.Group>
          <Form.Control
            type='number'
            placeholder='Enter amount'
            className='my-2'
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button variant="primary" type="submit" style={{ width: '100%' }}>
            Mint {amount} NFT
          </Button>
        </Form.Group>
      )}

    </Form>
  )
}

export default Mint;
