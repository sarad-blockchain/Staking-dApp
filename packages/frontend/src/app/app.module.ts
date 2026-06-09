import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

@NgModule({
  declarations: [AppComponent, NavbarComponent, HeroComponent, DashboardComponent],
  imports: [BrowserModule, CommonModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
