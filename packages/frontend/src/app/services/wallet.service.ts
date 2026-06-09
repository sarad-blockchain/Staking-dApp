import { Injectable, signal } from '@angular/core';
import { BrowserProvider, JsonRpcSigner } from 'ethers';

@Injectable({ providedIn: 'root' })
export class WalletService {
  provider: BrowserProvider | null = null;
  signer: JsonRpcSigner | null = null;

  address   = signal<string>('');
  network   = signal<string>('');
  connected = signal<boolean>(false);

  async connect(): Promise<void> {
    const eth = (window as any).ethereum;
    if (!eth) throw new Error('MetaMask no detectado');
    this.provider = new BrowserProvider(eth);
    await this.provider.send('eth_requestAccounts', []);
    this.signer   = await this.provider.getSigner();
    const addr    = await this.signer.getAddress();
    const net     = await this.provider.getNetwork();
    this.address.set(addr);
    this.network.set(net.name || `chain ${net.chainId}`);
    this.connected.set(true);
    eth.on('accountsChanged', () => location.reload());
    eth.on('chainChanged',    () => location.reload());
  }

  short(addr: string): string {
    if (!addr) return '';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  }
}
