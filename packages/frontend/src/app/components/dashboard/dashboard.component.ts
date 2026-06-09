import { Component, inject } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { StakingService } from '../../services/staking.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  wallet  = inject(WalletService);
  staking = inject(StakingService);

  toast    = '';
  toastErr = false;
  faqOpen: number | null = null;

  get step(): number {
    if (!this.wallet.connected()) return 0;
    const u = this.staking.userData();
    if (!u) return 1;
    if (!u.approved) return 1;
    if (Number(u.stakedFmt) === 0) return 2;
    if (!u.claimable) return 3;
    return 4;
  }

  toggleFaq(i: number) {
    this.faqOpen = this.faqOpen === i ? null : i;
  }

  async approve() {
    try {
      await this.staking.approve();
      this.show('Tokens approved');
    } catch(e: any) { this.show(e.reason ?? e.message, true); }
  }

  async stake() {
    try {
      await this.staking.stake();
      this.show('Tokens staked successfully');
    } catch(e: any) { this.show(e.reason ?? e.message, true); }
  }

  async claim() {
    try {
      await this.staking.claim();
      this.show('Reward claimed!');
    } catch(e: any) { this.show(e.reason ?? e.message, true); }
  }

  async withdraw() {
    if (!confirm('Withdraw all tokens? Your position will be reset.')) return;
    try {
      await this.staking.withdraw();
      this.show('Tokens withdrawn');
    } catch(e: any) { this.show(e.reason ?? e.message, true); }
  }

  async refresh() {
    await this.staking.loadParams();
    await this.staking.loadUser();
    this.show('Data refreshed');
  }

  async copyAddr() {
    await navigator.clipboard.writeText(this.wallet.address());
    this.show('Address copied');
  }

  show(msg: string, err = false) {
    this.toast = msg; this.toastErr = err;
    setTimeout(() => this.toast = '', 4200);
  }

  short(s: string) {
    if (!s) return '—';
    if (s === '0x0000000000000000000000000000000000000000') return 'Not configured';
    return s.slice(0, 6) + '...' + s.slice(-4);
  }
}
