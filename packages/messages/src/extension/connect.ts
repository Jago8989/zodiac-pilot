export enum PilotMessageType {
  /**  sent when the panel is toggled */
  PILOT_PANEL_OPENED = 'PILOT_PANEL_OPENED',
  /** sent the first time a tab is activated after the panel has been opened */
  PILOT_CONNECT = 'PILOT_CONNECT',
  /** sent when the panel is closed */
  PILOT_DISCONNECT = 'PILOT_DISCONNECT',
  PONG = 'EXTENSION::PONG',
  PROVIDE_VERSION = 'EXTENSION::PROVIDE_VERSION',
}

interface PilotConnect {
  type: PilotMessageType.PILOT_CONNECT
}
interface PilotDisconnect {
  type: PilotMessageType.PILOT_DISCONNECT
}

interface PilotPanelOpened {
  type: PilotMessageType.PILOT_PANEL_OPENED
  windowId: number
  tabId?: number
}

type Pong = {
  type: PilotMessageType.PONG
}

type ProvideVersion = {
  type: PilotMessageType.PROVIDE_VERSION
  version: string
}

export type Message =
  | PilotConnect
  | PilotDisconnect
  | PilotPanelOpened
  | Pong
  | ProvideVersion
