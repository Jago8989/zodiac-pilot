import { ConnectWallet, Page, WalletProvider } from '@/components'
import { jsonRpcProvider, parseRouteData, parseTransactionData } from '@/utils'
import { invariant, invariantResponse } from '@epic-web/invariant'
import { EXPLORER_URL, getChainId } from '@zodiac/chains'
import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from '@zodiac/messages'
import { waitForMultisigExecution } from '@zodiac/safe'
import { errorToast, PrimaryButton, successToast } from '@zodiac/ui'
import type { Eip1193Provider } from 'ethers'
import { SquareArrowOutUpRight } from 'lucide-react'
import { useState } from 'react'
import { useLoaderData } from 'react-router'
import {
  execute,
  ExecutionActionType,
  parsePrefixedAddress,
  planExecution,
  type ExecutionPlan,
  type ExecutionState,
} from 'ser-kit'
import { useAccount, useConnectorClient } from 'wagmi'
import type { Route } from './+types/submit.$route.$transactions'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const metaTransactions = parseTransactionData(params.transactions)
  const route = parseRouteData(params.route)

  invariantResponse(route.initiator != null, 'Route needs an initiator')

  // @ts-expect-error Bla
  const plan = await planExecution(metaTransactions, route)
  return {
    plan,
    initiator: parsePrefixedAddress(route.initiator),
    avatar: route.avatar,
    chainId: getChainId(route.avatar),
  }
}

const SubmitPage = ({
  loaderData: { initiator, chainId },
}: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header>Submit</Page.Header>

      <Page.Main>
        <WalletProvider>
          <ConnectWallet chainId={chainId} pilotAddress={initiator} />

          <div className="mt-8 flex">
            <SubmitTransaction />
          </div>
        </WalletProvider>
      </Page.Main>
    </Page>
  )
}

export default SubmitPage

const SubmitTransaction = () => {
  const { plan, chainId, avatar, initiator } = useLoaderData<typeof loader>()
  const walletAccount = useAccount()
  const { data: connectorClient } = useConnectorClient()
  const [submitPending, setSubmitPending] = useState(false)

  return (
    <PrimaryButton
      fluid
      disabled={
        walletAccount.chainId !== chainId ||
        walletAccount.address?.toLowerCase() !== initiator ||
        connectorClient == null ||
        submitPending
      }
      onClick={async () => {
        invariant(connectorClient != null, 'Client must be ready')

        setSubmitPending(true)

        const state = [] as ExecutionState

        try {
          await execute(
            plan as ExecutionPlan,
            state,
            connectorClient as Eip1193Provider,
            { origin: 'Zodiac Pilot' },
          )

          const safeTxHash =
            state[
              plan.findLastIndex(
                (action) =>
                  action.type === ExecutionActionType.PROPOSE_TRANSACTION,
              )
            ]
          const txHash =
            safeTxHash == null
              ? state[
                  plan.findLastIndex(
                    (action) =>
                      action.type === ExecutionActionType.EXECUTE_TRANSACTION,
                  )
                ]
              : undefined

          if (txHash) {
            console.debug(
              `Transaction batch has been submitted with transaction hash ${txHash}`,
            )
            const receipt =
              await jsonRpcProvider(chainId).waitForTransaction(txHash)
            console.debug(`Transaction ${txHash} has been executed`, receipt)
            successToast({
              title: 'Transaction batch has been executed',
              message: (
                <a
                  href={`${EXPLORER_URL[chainId]}/tx/${txHash}`}
                  className="inline-flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SquareArrowOutUpRight size={16} />
                  View in block explorer
                </a>
              ),
            })
          }

          if (safeTxHash) {
            console.debug(
              `Transaction batch has been proposed with safeTxHash ${safeTxHash}`,
            )

            const url = new URL('/transactions/tx', 'https://app.safe.global')

            url.searchParams.set('safe', avatar)
            url.searchParams.set(
              'id',
              `multisig_${parsePrefixedAddress(avatar)}_${safeTxHash}`,
            )

            successToast({
              title: 'Transaction batch has been proposed for execution',
              message: (
                <a
                  href={url.toString()}
                  className="inline-flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SquareArrowOutUpRight size={16} />
                  {'View in Safe{Wallet}'}
                </a>
              ),
            })
            // In case the other safe owners are quick enough to sign while the Pilot session is still open, we can show a toast with an execution confirmation
            const txHash = await waitForMultisigExecution(chainId, safeTxHash)
            console.debug(
              `Proposed transaction batch with safeTxHash ${safeTxHash} has been confirmed and executed with transaction hash ${txHash}`,
            )
            successToast({
              title:
                'Proposed Safe transaction has been confirmed and executed',
              message: (
                <a
                  href={`${EXPLORER_URL[chainId]}/tx/${txHash}`}
                  className="inline-flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SquareArrowOutUpRight size={16} />
                  View in block explorer
                </a>
              ),
            })
          }

          window.postMessage({
            type: CompanionAppMessageType.SUBMIT_SUCCESS,
          } satisfies CompanionAppMessage)
        } catch {
          errorToast({
            title: 'Error',
            message: 'Submitting the transaction batch failed',
          })
        } finally {
          setSubmitPending(false)
        }
      }}
    >
      Sign
    </PrimaryButton>
  )
}
