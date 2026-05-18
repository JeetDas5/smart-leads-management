import { LeadSource, LeadStatus } from "../constants/index.js";

export interface ILead {
  name: string;
  email: string;

  status: LeadStatus;
  source: LeadSource;

  createdBy: string;

  createdAt: Date;
  updatedAt: Date;
}
