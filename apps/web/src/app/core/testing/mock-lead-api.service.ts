import { Injectable, signal } from '@angular/core';
import { Observable, map, timer } from 'rxjs';

import { LeadApi } from '../api/lead-api';
import { LeadReceipt, LeadRequest } from '../models/lead.models';

@Injectable()
export class MockLeadApiService implements LeadApi {
  readonly submissions = signal<readonly LeadRequest[]>([]);

  submitLead(request: LeadRequest): Observable<LeadReceipt> {
    return timer(650).pipe(
      map(() => {
        this.submissions.update((submissions) => [...submissions, request]);

        return {
          id: `lead-${this.submissions().length.toString().padStart(3, '0')}`,
          receivedAt: new Date().toISOString(),
        };
      }),
    );
  }
}
