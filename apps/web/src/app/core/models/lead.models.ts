export interface LeadRequest {
  readonly name: string;
  readonly email: string;
  readonly teamSize: string;
}

export interface LeadReceipt {
  readonly id: string;
  readonly receivedAt: string;
}
