import React from 'react'
import { useEffect, useState } from 'react'
import { RiFileCopy2Line, RiGroupLine } from 'react-icons/ri'
import { encodeSingle, TransactionInput } from 'react-multisend'
import { toast } from 'react-toastify'

import { Flex, Tag } from '../../components'
import { JsonRpcError } from '../../types'
import { decodeRolesError } from '../../utils'
import { isPermissionsError } from '../../utils/decodeRolesError'
import { useWrappingProvider } from '../ProvideProvider'

import classes from './style.module.css'

const RolePermissionCheck: React.FC<{
  transaction: TransactionInput
  mini?: boolean
}> = ({ transaction, mini = false }) => {
  const [error, setError] = useState<string | undefined | false>(undefined)
  const wrappingProvider = useWrappingProvider()

  const transactionEncoded = encodeSingle(transaction)

  useEffect(() => {
    let canceled = false
    wrappingProvider
      .request({
        method: 'eth_estimateGas',
        params: [transactionEncoded],
      })
      .then(() => {
        if (!canceled) setError(false)
      })
      .catch((e: JsonRpcError) => {
        const decodedError = decodeRolesError(e)
        if (!canceled) {
          setError(isPermissionsError(decodedError) ? decodedError : false)
        }
      })

    return () => {
      canceled = true
    }
  }, [wrappingProvider, transactionEncoded])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(
      JSON.stringify(transactionEncoded, undefined, 2)
    )
    toast(<>Transaction data has been copied to clipboard.</>)
  }

  if (error === undefined) return null

  if (mini) {
    return (
      <>
        {error === false ? (
          <Tag head={<RiGroupLine />} color="success"></Tag>
        ) : (
          <Tag head={<RiGroupLine />} color="danger"></Tag>
        )}
      </>
    )
  }

  return (
    <Flex gap={2} direction="column" justifyContent="space-between">
      <Flex gap={2} justifyContent="space-between" alignItems="center">
        <Flex gap={2} justifyContent="start" alignItems="center">
          <div className={classes.checkLabel}>Role permissions</div>

          <Flex
            gap={0}
            justifyContent="center"
            className={classes.tagContainer}
          >
            {error === false ? (
              <Tag head={<RiGroupLine />} color="success">
                Allowed
              </Tag>
            ) : (
              <Tag head={<RiGroupLine />} color="danger">
                {error}
              </Tag>
            )}
          </Flex>
        </Flex>
        {error && (
          <button onClick={copyToClipboard} className={classes.link}>
            Copy data
            <RiFileCopy2Line />
          </button>
        )}
      </Flex>
    </Flex>
  )
}

export default RolePermissionCheck
