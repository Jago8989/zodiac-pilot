import type { ExecutionRoute } from '@zodiac/schema'

export enum CompanionAppMessageType {
  SAVE_ROUTE = 'COMPANION::SAVE_ROUTE',
  OPEN_PILOT = 'COMPANION::OPEN_PILOT',
  SUBMIT_SUCCESS = 'COMPANION::SUBMIT_SUCCESS',
  REQUEST_FORK_INFO = 'COMPANION::REQUEST_FORK_INFO',
  FORK_UPDATED = 'COMPANION::FORK_UPDATED',
  PING = 'COMPANION::PING',
  REQUEST_VERSION = 'COMPANION::REQUEST_VERSION',
}

type CompanionAppSaveRouteMessage = {
  type: CompanionAppMessageType.SAVE_ROUTE
  data: ExecutionRoute
}

type CompanionAppOpenPilotMessage = {
  type: CompanionAppMessageType.OPEN_PILOT
}

type CompanionAppSubmitSuccessMessage = {
  type: CompanionAppMessageType.SUBMIT_SUCCESS
}

type CompanionAppRequestForkInfoMessage = {
  type: CompanionAppMessageType.REQUEST_FORK_INFO
}

type CompanionAppForkUpdateMessage = {
  type: CompanionAppMessageType.FORK_UPDATED
  forkUrl: string | null
}

type CompanionAppPingMessage = {
  type: CompanionAppMessageType.PING
}

type CompanionAppRequestVersionMessage = {
  type: CompanionAppMessageType.REQUEST_VERSION
}

export type CompanionAppMessage =
  | CompanionAppSaveRouteMessage
  | CompanionAppOpenPilotMessage
  | CompanionAppSubmitSuccessMessage
  | CompanionAppRequestForkInfoMessage
  | CompanionAppForkUpdateMessage
  | CompanionAppPingMessage
  | CompanionAppRequestVersionMessage
