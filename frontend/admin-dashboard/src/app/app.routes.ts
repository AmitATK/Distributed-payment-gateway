import { Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { DashboardComponent } from './dashboard.component';
import { WebhooksComponent } from './webhooks.component';

export const routes: Routes = [
  {
    path:'',
    component: LayoutComponent,
    children:[
      { path:'', component: DashboardComponent },
      { path:'webhooks', component: WebhooksComponent }
    ]
  }
];
