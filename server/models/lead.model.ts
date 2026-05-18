import mongoose, { Schema } from "mongoose";

import { type ILead } from "../interfaces/index.js";
import { LeadSource, LeadStatus } from "../constants/index.js";

const leadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: Object.values(LeadStatus),
      default: LeadStatus.NEW,
      index: true,
    },

    source: {
      type: String,
      enum: Object.values(LeadSource),
      required: true,
      index: true,
    },

    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

leadSchema.index({
  name: "text",
  email: "text",
});

const Lead = mongoose.model<ILead>("Lead", leadSchema);

export default Lead;
