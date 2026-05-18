import { ApiError } from "../utils/index.js";
import { type AuthRequest } from "../middlewares/index.js";
import type { Request, Response, NextFunction } from "express";
import { createLeadSchema, updateLeadSchema } from "../validators/index.js";
import { createLead, deleteLead, getLeads, getSingleLead, updateLead } from "../services/index.js";

export const createLeadHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

export const getLeadsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getLeads({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,

      status: req.query.status as string,

      source: req.query.source as string,

      search: req.query.search as string,

      sort: req.query.sort as string,
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

export const getSingleLeadHandler = async (req: Request, res: Response, next: NextFunction) => {
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

export const updateLeadHandler = async (req: Request, res: Response, next: NextFunction) => {
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

export const deleteLeadHandler = async (req: Request, res: Response, next: NextFunction) => {
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
