import { Component } from '@angular/core';
import { ApiService } from './services/api.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  standalone:true,
  imports:[MatTableModule, MatButtonModule, MatCardModule],
  template:`
  <mat-card>
    <h2>Failed Webhooks</h2>

    <table mat-table [dataSource]="jobs">

      <ng-container matColumnDef="job">
        <th mat-header-cell *matHeaderCellDef>Job ID</th>
        <td mat-cell *matCellDef="let j">{{j.jobId}}</td>
      </ng-container>

      <ng-container matColumnDef="txn">
        <th mat-header-cell *matHeaderCellDef>Transaction</th>
        <td mat-cell *matCellDef="let j">{{j.transactionId}}</td>
      </ng-container>

      <ng-container matColumnDef="attempts">
        <th mat-header-cell *matHeaderCellDef>Attempts</th>
        <td mat-cell *matCellDef="let j">{{j.attempts}}</td>
      </ng-container>

      <ng-container matColumnDef="action">
        <th mat-header-cell *matHeaderCellDef>Action</th>
        <td mat-cell *matCellDef="let j">
          <button mat-raised-button color="primary" (click)="replay(j.jobId)">
            Replay
          </button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="cols"></tr>
      <tr mat-row *matRowDef="let row; columns: cols;"></tr>
    </table>
  </mat-card>
  `
})
export class WebhooksComponent {
  jobs:any[]=[];
  cols = ['job','txn','attempts','action'];

  constructor(private api:ApiService){
    api.getFailedWebhooks().subscribe(d=>this.jobs=d);
  }

  replay(id:string){
    this.api.replay(id).subscribe(()=>alert("Replayed"));
  }
}
