import { Document } from "mongoose";

import { LeadSource, LeadStatus } from "../constants/index.js";

export interface ILead extends Document {
  name: string;
  email: string;

  status: LeadStatus;
  source: LeadSource;

  createdBy: string;

  createdAt: Date;
  updatedAt: Date;
}
