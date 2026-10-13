/** Implement an authenticated router adapter to supply these values. Never use page transfers here. */
export type ConnectedDevice = {
  id: string;
  name: string;
  address: string;
  connectedAt: string;
  receivedBytes: number;
  sentBytes: number;
  current: boolean;
};
export type AccountNetworkSnapshot = {
  receivedBytes: number;
  sentBytes: number;
  updatedAt: string;
  devices: ConnectedDevice[];
};
export function accountConsumedBytes(snapshot: AccountNetworkSnapshot): number {
  return Math.max(0, snapshot.receivedBytes) + Math.max(0, snapshot.sentBytes);
}