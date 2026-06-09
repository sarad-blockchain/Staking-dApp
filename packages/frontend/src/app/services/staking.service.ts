import { Injectable, signal } from '@angular/core';
import { Contract, MaxUint256, formatEther, formatUnits } from 'ethers';
import { WalletService } from './wallet.service';
import contracts from '../config/contracts.json';
import abis from '../config/abis.json';

const STAKING_ADDR = contracts.stakingAddress;
const TOKEN_ADDR   = contracts.tokenAddress;

const STAKING_ABI = abis.staking;
const TOKEN_ABI = abis.token;

export interface StakingParams {
  period: bigint;
  amount: bigint;
  reward: bigint;
  dec: number;
  sym: string;
  periodHours: string;
  amountFmt: string;
  rewardFmt: string;
}

export interface UserData {
  stakedFmt: string;
  tokenBalFmt: string;
  allowanceFmt: string;
  approved: boolean;
  timestamp: bigint;
  timestampDate: string;
  timeLeft: string;
  periodPct: number;
  claimable: boolean;
}

@Injectable({ providedIn: 'root' })
export class StakingService {
  stakingC: Contract | null = null;
  tokenC:   Contract | null = null;

  params   = signal<StakingParams | null>(null);
  userData = signal<UserData | null>(null);
  loading  = signal<string>('');
  error    = signal<string>('');

  readonly stakingAddr = STAKING_ADDR;
  readonly tokenAddr   = TOKEN_ADDR;

  constructor(private wallet: WalletService) {}

  init(): void {
    const s = this.wallet.signer;
    if (!s) return;
    this.stakingC = new Contract(STAKING_ADDR, STAKING_ABI, s);
    this.tokenC   = new Contract(TOKEN_ADDR,   TOKEN_ABI,   s);
  }

  async loadParams(): Promise<void> {
    if (!this.stakingC || !this.tokenC) return;
    try {
      const [period, amount, reward, dec, sym] = await Promise.all([
        this.stakingC['stakingPeriod'](),
        this.stakingC['fixedStakingAmount'](),
        this.stakingC['rewardPerPeriod'](),
        this.tokenC['decimals'](),
        this.tokenC['symbol'](),
      ]);
      this.params.set({
        period, amount, reward, dec,
        sym,
        periodHours: (Number(period) / 3600).toFixed(1),
        amountFmt:   formatUnits(amount, dec),
        rewardFmt:   parseFloat(formatEther(reward)).toFixed(5),
      });
    } catch { this.error.set('Configura las direcciones de contrato'); }
  }

  async loadUser(): Promise<void> {
    if (!this.stakingC || !this.tokenC) return;
    const addr = this.wallet.address();
    const p    = this.params();
    if (!addr || !p) return;
    try {
      const [bal, ts, tbBal, allow] = await Promise.all([
        this.stakingC['userBalances'](addr),
        this.stakingC['userStakingTimestamps'](addr),
        this.tokenC['balanceOf'](addr),
        this.tokenC['allowance'](addr, STAKING_ADDR),
      ]);
      const approved = p.amount > 0n && allow >= p.amount;
      let timeLeft = '—', periodPct = 0, claimable = false, tsDate = '—';
      if (ts > 0n) {
        tsDate = new Date(Number(ts) * 1000).toLocaleString('es-ES');
        const end  = Number(ts) + Number(p.period);
        const now  = Math.floor(Date.now() / 1000);
        periodPct  = Math.min(100, Math.floor(((now - Number(ts)) / Number(p.period)) * 100));
        claimable  = now >= end;
        if (claimable) { timeLeft = 'Listo para reclamar'; }
        else { const l = end - now; timeLeft = `${Math.floor(l/3600)}h ${Math.floor((l%3600)/60)}m`; }
      }
      this.userData.set({
        stakedFmt:     formatUnits(bal, p.dec),
        tokenBalFmt:   formatUnits(tbBal, p.dec),
        allowanceFmt:  formatUnits(allow, p.dec),
        approved, timestamp: ts, timestampDate: tsDate,
        timeLeft, periodPct, claimable,
      });
    } catch (e: any) { this.error.set(e.message); }
  }

  async approve(): Promise<void> {
    if (!this.tokenC) return;
    const p = this.params();
    this.loading.set('approve');
    try {
      const tx = await this.tokenC['approve'](STAKING_ADDR, p?.amount ?? MaxUint256);
      await tx.wait();
      await this.loadUser();
    } finally { this.loading.set(''); }
  }

  async stake(): Promise<void> {
    if (!this.stakingC) return;
    const p = this.params();
    if (!p) return;
    this.loading.set('stake');
    try {
      const tx = await this.stakingC['depositTokens'](p.amount);
      await tx.wait();
      await this.loadUser();
    } finally { this.loading.set(''); }
  }

  async claim(): Promise<void> {
    if (!this.stakingC) return;
    this.loading.set('claim');
    try {
      const tx = await this.stakingC['claimReward']();
      await tx.wait();
      await this.loadUser();
    } finally { this.loading.set(''); }
  }

  async withdraw(): Promise<void> {
    if (!this.stakingC) return;
    this.loading.set('withdraw');
    try {
      const tx = await this.stakingC['withdrawTokens']();
      await tx.wait();
      await this.loadUser();
    } finally { this.loading.set(''); }
  }

  short(addr: string): string {
    if (!addr || addr === '0x0000000000000000000000000000000000000000') return 'No configurado';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  }
}
