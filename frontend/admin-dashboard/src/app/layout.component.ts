import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from './theme.service';

@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
  <mat-toolbar color="primary">
    <span>💳 Fintech Admin</span>
    <span class="spacer"></span>

    <a mat-button routerLink="/">Dashboard</a>
    <a mat-button routerLink="/webhooks">Webhooks</a>

    <button mat-icon-button (click)="theme.toggle()">
      <mat-icon>dark_mode</mat-icon>
    </button>
  </mat-toolbar>

  <div class="container">
    <router-outlet></router-outlet>
  </div>
  `,
  styles:[`
    .spacer{flex:1}
    .container{padding:20px;}
  `]
})
export class LayoutComponent {
  constructor(public theme: ThemeService){}
}
