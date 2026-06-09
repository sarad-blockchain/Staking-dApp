import { Component, inject, HostListener } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { StakingService } from '../../services/staking.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  wallet  = inject(WalletService);
  staking = inject(StakingService);
  busy    = false;
  toast   = '';
  active  = 'hero';

  async connect() {
    if (this.busy) return;
    this.busy = true;
    try {
      await this.wallet.connect();
      this.staking.init();
      await this.staking.loadParams();
      await this.staking.loadUser();
      this.showToast('Wallet connected');
    } catch(e: any) {
      this.showToast(e.message ?? 'Connection error', true);
    } finally { this.busy = false; }
  }

  scrollTo(id: string) {
    this.active = id;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  @HostListener('window:scroll')
  onScroll() {
    const sections = ['hero', 'staking', 'rewards', 'how-it-works', 'faq'];
    for (const id of [...sections].reverse()) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 100) {
        this.active = id;
        return;
      }
    }
    this.active = 'hero';
  }

  showToast(msg: string, err = false) {
    this.toast = (err ? 'error:' : '') + msg;
    setTimeout(() => this.toast = '', 4000);
  }
}
