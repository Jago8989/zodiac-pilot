import React from 'react'
import { RawTransactionInput } from 'react-multisend'

interface Props {
  value: RawTransactionInput
}

const RawTransaction: React.FC<Props> = ({ value }) => (
  <div>
    <label>
      <span>Data</span>
      <textarea readOnly value={value.data} />
    </label>

    <label>
      <span>Value (wei)</span>
      <input type="number" readOnly value={value.value} />
    </label>
  </div>
)

export default RawTransaction
