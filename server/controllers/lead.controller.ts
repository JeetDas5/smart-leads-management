import { Parser } from "json2csv";
import { ApiError } from "../utils/index.js";
import { type AuthRequest } from "../middlewares/index.js";
import type { Request, Response, NextFunction } from "express";
import { createLeadSchema, updateLeadSchema } from "../validators/index.js";
import {
  createLead,
  deleteLead,
  exportLeadsToCSV,
  getLeads,
  getSingleLead,
  updateLead,
} from "../services/index.js";

export const createLeadHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }
    const validatedData = createLeadSchema.parse(req.body);

    const lead = await createLead({
      ...validatedData,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadsHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const createdBy =
      req.user.role === "sales" ? req.user.userId : (req.query.createdBy as string);

    const data = await getLeads({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,

      status: req.query.status as string,

      source: req.query.source as string,

      search: req.query.search as string,

      sort: req.query.sort as string,

      createdBy,
    });

    res.status(200).json({
      success: true,
      message: "Leads fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};


export const getSingleLeadHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.params.id) {
      throw new ApiError(400, "Lead ID is required");
    }

    const leadId = req.params.id;
    if (typeof leadId !== "string") {
      throw new ApiError(400, "Lead ID is required");
    }

    const lead = await getSingleLead(leadId);

    if (!lead) {
      throw new ApiError(404, "Lead not found");
    }

    res.status(200).json({
      success: true,
      message: "Lead fetched successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLeadHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.params.id) {
      throw new ApiError(400, "Lead ID is required");
    }

    const leadId = req.params.id;
    if (typeof leadId !== "string") {
      throw new ApiError(400, "Lead ID is required");
    }

    const validatedData = updateLeadSchema.parse(req.body);

    const lead = await updateLead(leadId, validatedData);

    if (!lead) {
      throw new ApiError(404, "Lead not found");
    }

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLeadHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const leadId = req.params.id;

    if (typeof leadId !== "string") {
      throw new ApiError(400, "Lead ID is required");
    }

    const lead = await deleteLead(leadId);

    if (!lead) {
      throw new ApiError(404, "Lead not found");
    }

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const exportLeadsHandler = async (_req: Request, res: Response) => {
  const leads = await exportLeadsToCSV();

  const fields = ["name", "email", "status", "source", "createdAt"];

  const parser = new Parser({
    fields,
  });

  const csv = parser.parse(leads);

  res.header("Content-Type", "text/csv");

  res.attachment("leads.csv");

  return res.send(csv);
};

import { Lead, User } from "../models/index.js";
import { LeadStatus } from "../constants/enum.js";

export const getLeadsStatsHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    if (req.user.role === "sales") {
      const userId = req.user.userId;
      
      const [total, newLeads, contacted, qualified, lost] = await Promise.all([
        Lead.countDocuments({ createdBy: userId }),
        Lead.countDocuments({ createdBy: userId, status: LeadStatus.NEW }),
        Lead.countDocuments({ createdBy: userId, status: LeadStatus.CONTACTED }),
        Lead.countDocuments({ createdBy: userId, status: LeadStatus.QUALIFIED }),
        Lead.countDocuments({ createdBy: userId, status: LeadStatus.LOST }),
      ]);

      const conversionRate = total > 0 ? parseFloat(((qualified / total) * 100).toFixed(1)) : 0;

      return res.status(200).json({
        success: true,
        data: {
          total,
          new: newLeads,
          contacted,
          qualified,
          lost,
          conversionRate,
        },
      });
    }

    // For admins: return overall stats + breakdown of every salesperson
    const salespersons = await User.find({ role: "sales" }).select("name email");

    const [overallTotal, overallNew, overallContacted, overallQualified, overallLost] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: LeadStatus.NEW }),
      Lead.countDocuments({ status: LeadStatus.CONTACTED }),
      Lead.countDocuments({ status: LeadStatus.QUALIFIED }),
      Lead.countDocuments({ status: LeadStatus.LOST }),
    ]);

    const overallConversionRate = overallTotal > 0 ? parseFloat(((overallQualified / overallTotal) * 100).toFixed(1)) : 0;

    const breakdownPromises = salespersons.map(async (sp) => {
      const spId = sp._id.toString();
      const [total, newLeads, contacted, qualified, lost] = await Promise.all([
        Lead.countDocuments({ createdBy: spId }),
        Lead.countDocuments({ createdBy: spId, status: LeadStatus.NEW }),
        Lead.countDocuments({ createdBy: spId, status: LeadStatus.CONTACTED }),
        Lead.countDocuments({ createdBy: spId, status: LeadStatus.QUALIFIED }),
        Lead.countDocuments({ createdBy: spId, status: LeadStatus.LOST }),
      ]);

      const conversionRate = total > 0 ? parseFloat(((qualified / total) * 100).toFixed(1)) : 0;

      return {
        salesperson: {
          id: spId,
          name: sp.name,
          email: sp.email,
        },
        stats: {
          total,
          new: newLeads,
          contacted,
          qualified,
          lost,
          conversionRate,
        },
      };
    });

    const breakdown = await Promise.all(breakdownPromises);

    res.status(200).json({
      success: true,
      data: {
        overall: {
          total: overallTotal,
          new: overallNew,
          contacted: overallContacted,
          qualified: overallQualified,
          lost: overallLost,
          conversionRate: overallConversionRate,
        },
        salespersons: breakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

