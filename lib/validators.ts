import { z } from "zod";
const short = (max=180) => z.string().trim().max(max);
const email = z.email().max(254);
export const inquirySchema = z.object({
  name: short(120).min(2), email, phone: short(40).optional().default(""),
  organisation: short(160).optional().default(""), location: short(160).optional().default(""),
  serviceSlug: short(120).optional().default(""), farmSize: short(100).optional().default(""),
  enterprise: short(160).optional().default(""), productionStage: short(100).optional().default(""),
  budgetRange: short(100).optional().default(""), message: z.string().trim().min(10).max(5000),
  preferredContact: z.enum(["email","phone","whatsapp"]).default("email"), website: z.string().max(0).optional()
});
export const registerSchema = z.object({ name: short(120).min(2), email, phone: short(40).optional().default(""), password: z.string().min(10).max(128) });
export const loginSchema = z.object({ email, password: z.string().min(1).max(128) });
export const farmPlanSchema = z.object({
  clientName: short(120).min(2), email, phone: short(40).optional().default(""),
  location: short(180).min(2), landSize: short(100).min(1), landStatus: short(100).optional().default(""),
  waterSource: short(120).optional().default(""), irrigationStatus: short(120).optional().default(""),
  enterpriseType: z.enum(["crop","livestock","poultry","aquaculture","mixed","other"]),
  cropsOrAnimals: short(300).min(2), budgetRange: short(100).optional().default(""),
  labourAvailability: short(120).optional().default(""), marketGoal: short(120).optional().default(""),
  experienceLevel: short(100).optional().default(""), challenges: z.string().max(2000).optional().default(""),
  extraDetails: z.string().max(3000).optional().default("")
});
