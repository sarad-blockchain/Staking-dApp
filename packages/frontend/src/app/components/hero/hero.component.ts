import {
  Component, OnInit, OnDestroy,
  ElementRef, ViewChild, AfterViewInit, inject, NgZone
} from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { StakingService } from '../../services/staking.service';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('coinCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  wallet  = inject(WalletService);
  staking = inject(StakingService);
  private zone = inject(NgZone);

  private cv!: HTMLCanvasElement;
  private cx!: CanvasRenderingContext2D;
  private W = 0;
  private H = 0;
  private raf = 0;
  private burstTimer = 0;

  private clouds: Cloud[]   = [];
  private coins:  Coin[]    = [];
  private sparks: Spark[]   = [];

  ngAfterViewInit() {
    this.cv = this.canvasRef.nativeElement;
    this.cx = this.cv.getContext('2d')!;
    this.zone.runOutsideAngular(() => {
      this.resize();
      window.addEventListener('resize', this.onResize);
      this.frame();
      // Start burst cycle immediately
      this.scheduleBursts();
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.raf);
    clearTimeout(this.burstTimer);
    window.removeEventListener('resize', this.onResize);
  }

  private onResize = () => { this.resize(); };

  private resize() {
    const el = this.cv.parentElement!;
    this.W = this.cv.width  = el.clientWidth;
    this.H = this.cv.height = el.clientHeight;
    this.initScene();
  }

  /* ─── SCENE INIT ─── */
  private initScene() {
    this.clouds = [];
    this.coins  = [];
    this.sparks = [];

    // Dense bottom cloud field
    for (let i = 0; i < 18; i++) {
      this.clouds.push(this.mkCloud(
        Math.random() * this.W * 1.4 - this.W * 0.2,
        this.H * (0.70 + Math.random() * 0.22),
        1.3 + Math.random() * 1.3,
        0.03 + Math.random() * 0.06
      ));
    }

    // Foreground hero clouds — bigger and more prominent
    [
      { x: -180,          y: this.H * 0.78, sc: 3.0, spd: 0.04 },
      { x: this.W * 0.10, y: this.H * 0.86, sc: 3.5, spd: 0.03 },
      { x: this.W * 0.38, y: this.H * 0.80, sc: 2.6, spd: 0.05 },
      { x: this.W * 0.65, y: this.H * 0.88, sc: 3.0, spd: 0.035 },
      { x: this.W * 0.92, y: this.H * 0.78, sc: 2.4, spd: 0.045 },
      { x: this.W * 1.1,  y: this.H * 0.84, sc: 2.8, spd: 0.038 },
    ].forEach(c => this.clouds.push(this.mkCloud(c.x, c.y, c.sc, c.spd)));

    // === AMBIENT FLOATING COINS — bigger, more opaque, spread across scene ===
    // Large hero coins (foreground, very visible)
    const heroSizes  = [45, 52, 38, 60, 42, 48, 35, 55];
    const heroAlphas = [0.92, 0.88, 0.85, 0.95, 0.82, 0.90, 0.80, 0.88];
    for (let i = 0; i < 8; i++) {
      this.coins.push(this.mkAmbientCoin(
        (i / 8) * this.W * 0.9 + Math.random() * (this.W * 0.1),
        this.H * (0.52 + Math.random() * 0.30),
        heroSizes[i],
        heroAlphas[i]
      ));
    }

    // Medium coins scattered around
    for (let i = 0; i < 10; i++) {
      this.coins.push(this.mkAmbientCoin(
        Math.random() * this.W,
        this.H * (0.45 + Math.random() * 0.40),
        18 + Math.random() * 22,
        0.55 + Math.random() * 0.30
      ));
    }

    // Small sparkle coins in background
    for (let i = 0; i < 8; i++) {
      this.coins.push(this.mkAmbientCoin(
        Math.random() * this.W,
        Math.random() * this.H * 0.55,
        8 + Math.random() * 10,
        0.35 + Math.random() * 0.25
      ));
    }

    // Sparkles
    for (let i = 0; i < 90; i++) this.sparks.push(this.mkSpark());
  }

  /* ─── CLOUD ─── */
  private mkCloud(x: number, y: number, sc: number, spd: number): Cloud {
    return {
      x, y, sc, spd,
      puffs: [
        { dx:  0.00, dy:  0.00, r: 1.00 },
        { dx:  0.58, dy: -0.40, r: 0.76 },
        { dx: -0.54, dy: -0.30, r: 0.72 },
        { dx:  0.95, dy:  0.06, r: 0.62 },
        { dx: -0.92, dy:  0.08, r: 0.60 },
        { dx:  0.30, dy: -0.64, r: 0.55 },
        { dx: -0.28, dy: -0.52, r: 0.52 },
        { dx:  0.72, dy: -0.52, r: 0.50 },
      ]
    };
  }

  private drawCloud(c: Cloud) {
    const base = 88 * c.sc;
    const cx = this.cx;
    cx.save();
    cx.translate(c.x, c.y);
    for (const p of c.puffs) {
      const grd = cx.createRadialGradient(
        p.dx * base * 0.22, p.dy * base * 0.22 - base * 0.12, 0,
        p.dx * base * 0.22, p.dy * base * 0.22,                base * p.r
      );
      grd.addColorStop(0,    'rgba(255,255,255,1)');
      grd.addColorStop(0.50, 'rgba(244,250,255,0.97)');
      grd.addColorStop(0.85, 'rgba(218,232,255,0.55)');
      grd.addColorStop(1,    'rgba(200,220,255,0)');
      cx.beginPath();
      cx.arc(p.dx * base, p.dy * base, base * p.r, 0, Math.PI * 2);
      cx.fillStyle = grd;
      cx.fill();
    }
    // bottom shadow
    const shad = cx.createLinearGradient(0, base * 0.12, 0, base * 0.62);
    shad.addColorStop(0, 'rgba(150,175,255,0)');
    shad.addColorStop(1, 'rgba(130,155,240,0.14)');
    cx.beginPath();
    cx.arc(0, base * 0.28, base * 0.88, 0, Math.PI * 2);
    cx.fillStyle = shad;
    cx.fill();
    cx.restore();
  }

  /* ─── AMBIENT COIN (slow float, fully visible) ─── */
  private mkAmbientCoin(x: number, y: number, r: number, alpha: number): Coin {
    return {
      x, y,
      vx:     (Math.random() - 0.5) * 0.18,
      vy:     -0.12 - Math.random() * 0.22,   // gentle upward drift
      grav:   0,
      r,
      tilt:   Math.random() * Math.PI,
      tiltSp: (Math.random() - 0.5) * 0.028,
      alpha,
      life:   null,
      decay:  0,
      trail:  null,
      shim:   Math.random() * Math.PI * 2,
      shimSp: 0.020 + Math.random() * 0.025,
    };
  }

  /* ─── BURST COIN ─── */
  private mkBurstCoin(x: number, y: number): Coin {
    // Narrow upward cone — coins rise gracefully, not explosively
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.7;
    const speed = 1.6 + Math.random() * 2.4;
    return {
      x, y,
      vx:     Math.cos(angle) * speed,
      vy:     Math.sin(angle) * speed - 2.2,   // gentle upward launch
      grav:   0.022 + Math.random() * 0.018,   // low gravity = slow graceful arc
      r:      18 + Math.random() * 28,
      tilt:   Math.random() * Math.PI,
      tiltSp: (Math.random() - 0.5) * 0.032,  // slow tilt
      alpha:  0.95,
      life:   1.0,
      decay:  0.0010 + Math.random() * 0.0008, // long life — fade very slowly
      trail:  [],
      shim:   Math.random() * Math.PI * 2,
      shimSp: 0.020 + Math.random() * 0.018,
    };
  }

  /* ─── 3D COIN DRAW ─── */
  private drawCoin(c: Coin) {
    const cx = this.cx;
    const sy = Math.abs(Math.cos(c.tilt));
    const r  = c.r;
    const clampSy = Math.max(sy, 0.04);

    cx.save();
    cx.globalAlpha = c.alpha;

    // Drop shadow for large coins
    if (r > 20 && c.life === null) {
      cx.save();
      cx.globalAlpha = c.alpha * 0.22;
      const shadow = cx.createRadialGradient(c.x + r * 0.15, c.y + r * 0.3, 0, c.x + r * 0.1, c.y + r * 0.35, r * 0.85);
      shadow.addColorStop(0, 'rgba(80,40,0,0.55)');
      shadow.addColorStop(1, 'rgba(80,40,0,0)');
      cx.beginPath();
      cx.ellipse(c.x + r * 0.1, c.y + r * 0.35, r * 0.85, r * 0.25, 0, 0, Math.PI * 2);
      cx.fillStyle = shadow;
      cx.fill();
      cx.restore();
    }

    // Trail glow for burst coins
    if (c.trail && c.trail.length > 2) {
      for (let i = 1; i < c.trail.length; i++) {
        const prog = i / c.trail.length;
        cx.save();
        cx.globalAlpha = c.alpha * prog * 0.18;
        cx.strokeStyle = '#FFD740';
        cx.lineWidth   = r * clampSy * prog * 0.65;
        cx.lineCap     = 'round';
        cx.beginPath();
        cx.moveTo(c.trail[i - 1].x, c.trail[i - 1].y);
        cx.lineTo(c.trail[i].x, c.trail[i].y);
        cx.stroke();
        cx.restore();
      }
    }

    cx.translate(c.x, c.y);
    cx.scale(1, clampSy);

    const shimmer = 0.5 + 0.5 * Math.sin(c.shim);

    // Side rim — depth illusion
    if (clampSy < 0.85) {
      const rimOffset = r * 0.06;
      const rimGrad = cx.createLinearGradient(-r, 0, r, 0);
      rimGrad.addColorStop(0,   '#6A3800');
      rimGrad.addColorStop(0.5, '#C07800');
      rimGrad.addColorStop(1,   '#6A3800');
      cx.save();
      cx.scale(1, 1 / clampSy);
      cx.translate(0, r * clampSy * 0.14);
      cx.scale(1, clampSy);
      cx.beginPath();
      cx.arc(0, 0, r, 0, Math.PI * 2);
      cx.fillStyle = rimGrad;
      cx.fill();
      cx.restore();
    }

    // Outer glow halo for large coins
    if (r > 25) {
      const haloGrad = cx.createRadialGradient(0, 0, r * 0.8, 0, 0, r * 1.45);
      haloGrad.addColorStop(0, `rgba(255, 210, 50, ${0.18 + shimmer * 0.10})`);
      haloGrad.addColorStop(1, 'rgba(255, 180, 0, 0)');
      cx.beginPath();
      cx.arc(0, 0, r * 1.45, 0, Math.PI * 2);
      cx.fillStyle = haloGrad;
      cx.fill();
    }

    // Main face gradient (radial, off-center highlight)
    const g = cx.createRadialGradient(-r * 0.28, -r * 0.28, r * 0.02, r * 0.1, r * 0.1, r * 1.1);
    g.addColorStop(0,    `rgba(255, ${235 + Math.floor(shimmer * 20)}, ${90 + Math.floor(shimmer * 70)}, 1)`);
    g.addColorStop(0.20, '#FFD840');
    g.addColorStop(0.50, '#F0A800');
    g.addColorStop(0.78, '#C07800');
    g.addColorStop(1,    '#7A4800');
    cx.beginPath();
    cx.arc(0, 0, r, 0, Math.PI * 2);
    cx.fillStyle = g;
    cx.fill();

    // Outer rim ring
    cx.strokeStyle = `rgba(255, 220, 60, ${0.65 + shimmer * 0.25})`;
    cx.lineWidth   = r * 0.07;
    cx.stroke();

    // Inner ring
    cx.beginPath();
    cx.arc(0, 0, r * 0.68, 0, Math.PI * 2);
    cx.strokeStyle = `rgba(255, 200, 40, ${0.30 + shimmer * 0.15})`;
    cx.lineWidth   = r * 0.055;
    cx.stroke();

    // Star emboss
    cx.save();
    cx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a  = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const rr = i % 2 === 0 ? r * 0.40 : r * 0.22;
      const px = Math.cos(a) * rr, py = Math.sin(a) * rr;
      i === 0 ? cx.moveTo(px, py) : cx.lineTo(px, py);
    }
    cx.closePath();
    cx.fillStyle   = `rgba(255, 245, 100, ${0.22 + shimmer * 0.16})`;
    cx.strokeStyle = `rgba(255, 235, 60,  ${0.40 + shimmer * 0.18})`;
    cx.lineWidth   = r * 0.035;
    cx.fill();
    cx.stroke();
    cx.restore();

    // Primary highlight (top-left gloss)
    const hl = cx.createRadialGradient(-r * 0.3, -r * 0.32, 0, -r * 0.22, -r * 0.24, r * 0.46);
    hl.addColorStop(0,   `rgba(255,255,240,${0.72 + shimmer * 0.22})`);
    hl.addColorStop(0.55, `rgba(255,255,210,${0.14 + shimmer * 0.08})`);
    hl.addColorStop(1,   'rgba(255,255,200,0)');
    cx.beginPath();
    cx.arc(-r * 0.22, -r * 0.24, r * 0.46, 0, Math.PI * 2);
    cx.fillStyle = hl;
    cx.fill();

    // Secondary smaller highlight
    const hl2 = cx.createRadialGradient(r * 0.25, -r * 0.18, 0, r * 0.25, -r * 0.18, r * 0.20);
    hl2.addColorStop(0,  `rgba(255,255,255,${0.28 + shimmer * 0.12})`);
    hl2.addColorStop(1,  'rgba(255,255,255,0)');
    cx.beginPath();
    cx.arc(r * 0.25, -r * 0.18, r * 0.20, 0, Math.PI * 2);
    cx.fillStyle = hl2;
    cx.fill();

    cx.restore();
  }

  /* ─── SPARKLE ─── */
  private mkSpark(): Spark {
    return {
      x: Math.random() * this.W,
      y: Math.random() * this.H * 0.65,
      r: 0.6 + Math.random() * 1.6,
      a: 0.10 + Math.random() * 0.45,
      ph: Math.random() * Math.PI * 2,
      sp: 0.012 + Math.random() * 0.025,
    };
  }

  /* ─── BURST from cloud area ─── */
  burst(x: number, y: number, n = 14) {
    for (let i = 0; i < n; i++) this.coins.push(this.mkBurstCoin(x, y));
  }

  private scheduleBursts() {
    const go = () => {
      // Only 2-3 zones active, biased toward center/bottom
      const zones = [0.20, 0.38, 0.55, 0.72];
      const zoneX = zones[Math.floor(Math.random() * zones.length)];
      const bx = zoneX * this.W + (Math.random() - 0.5) * this.W * 0.08;
      const by = this.H * (0.80 + Math.random() * 0.08);
      const count = 5 + Math.floor(Math.random() * 5);  // 5-9 coins, not 10-22
      this.burst(bx, by, count);
      // Much slower cadence — every 3.5 to 6 seconds
      this.burstTimer = window.setTimeout(go, 3500 + Math.random() * 2500);
    };
    // First burst after a short pause so page loads first
    this.burstTimer = window.setTimeout(go, 1200);
  }

  /* ─── MAIN FRAME ─── */
  private frame = () => {
    const cx = this.cx;
    cx.clearRect(0, 0, this.W, this.H);

    // Sparkles
    for (const s of this.sparks) {
      s.ph += s.sp;
      cx.save();
      cx.globalAlpha = s.a * (0.4 + 0.6 * Math.sin(s.ph));
      cx.beginPath();
      cx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      cx.fillStyle = 'rgba(255,255,255,0.95)';
      cx.fill();
      cx.restore();
    }

    // Sort coins: ambient (life===null) behind, burst on top
    // Draw ambient first, burst last
    const ambient = this.coins.filter(c => c.life === null);
    const burst   = this.coins.filter(c => c.life !== null);

    for (const c of ambient) {
      c.x += c.vx;
      c.y += c.vy;
      c.vy += c.grav;
      c.tilt += c.tiltSp;
      c.shim += c.shimSp;
      // Wrap ambient coins — when they float off top, reset to bottom
      if (c.y < -c.r * 2) { c.y = this.H * 0.90; c.x = Math.random() * this.W; c.vy = -0.12 - Math.random() * 0.22; }
      if (c.x < -c.r * 2) c.x = this.W + c.r;
      if (c.x > this.W + c.r) c.x = -c.r;
      this.drawCoin(c);
    }

    for (let i = burst.length - 1; i >= 0; i--) {
      const c = burst[i];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += c.grav;
      c.tilt += c.tiltSp;
      c.shim += c.shimSp;
      if (c.trail) {
        c.trail.push({ x: c.x, y: c.y });
        if (c.trail.length > 14) c.trail.shift();
      }
      if (c.life !== null) {
        c.life -= c.decay;
        c.alpha = Math.max(0, c.life);
      }
      if (c.life !== null && c.alpha <= 0) {
        const idx = this.coins.indexOf(c);
        if (idx !== -1) this.coins.splice(idx, 1);
        continue;
      }
      this.drawCoin(c);
    }

    // Clouds (drawn after coins so they appear in front — like in reference image)
    for (const cl of this.clouds) {
      cl.x += cl.spd * 0.9;
      if (cl.x > this.W + 320) cl.x = -320 * cl.sc;
      this.drawCloud(cl);
    }

    this.raf = requestAnimationFrame(this.frame);
  };

  scrollToDash() {
    document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
  }
}

/* ─── TYPES ─── */
interface Cloud {
  x: number; y: number; sc: number; spd: number;
  puffs: { dx: number; dy: number; r: number }[];
}
interface Coin {
  x: number; y: number; vx: number; vy: number;
  grav: number; r: number; tilt: number; tiltSp: number;
  alpha: number; life: number | null; decay: number;
  trail: { x: number; y: number }[] | null;
  shim: number; shimSp: number;
}
interface Spark { x: number; y: number; r: number; a: number; ph: number; sp: number; }
