import { Observable } from 'rxjs';

import { LeadReceipt, LeadRequest } from '../models/lead.models';

export abstract class LeadApi {
  abstract submitLead(request: LeadRequest): Observable<LeadReceipt>;
}
