import { Lead } from "../models/index.js";

interface CreateLeadInput {
  name: string;
  email: string;
  status?: string;
  source: string;
  createdBy: string;
}

interface GetLeadsQuery {
  page?: number;
  limit?: number;
  status?: string;
  source?: string;
  search?: string;
  sort?: string;
}

export const createLead = async (data: CreateLeadInput) => {
  const lead = new Lead(data);
  return await lead.save();
};

export const getLeads = async (query: GetLeadsQuery) => {
  const { page = 1, limit = 10, status, source, search, sort = "latest" } = query;

  const filter: Record<string, unknown> = {};

  if (status) {
    filter.status = status;
  }

  if (source) {
    filter.source = source;
  }

  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  const sortOption: Record<string, 1 | -1> = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

  const skip = (page - 1) * limit;

  const [leads, total] = await Promise.all([Lead.find(filter).sort(sortOption).skip(skip).limit(limit), Lead.countDocuments(filter)]);

  return {
    leads,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getSingleLead = async (id: string) => {
  return await Lead.findById(id);
};

export const updateLead = async (id: string, data: Record<string, unknown>) => {
  return await Lead.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
};

export const deleteLead = async (id: string) => {
  return await Lead.findByIdAndDelete(id);
};
