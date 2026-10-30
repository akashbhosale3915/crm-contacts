import mongoose, { Schema, Document } from "mongoose";
import { isValidPhoneNumber } from "../validation/phone";

export interface IContact extends Document {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  company: string;
  tags: string[];
  createdDate: Date;
  updatedDate: Date;
  __v: number; // For optimistic concurrency
}

const ContactSchema = new Schema<IContact>(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    phone: {
      type: String,
      default: "",
      validate: {
        validator: (value: string) => value === "" || isValidPhoneNumber(value),
        message: "phone must contain exactly 10 digits",
      },
    },
    company: { type: String, default: "", trim: true, maxlength: 100 },
    tags: { type: [String], default: [] },
  },
  {
    timestamps: { createdAt: "createdDate", updatedAt: "updatedDate" },
    optimisticConcurrency: true,
  },
);

ContactSchema.index({ tags: 1 });
ContactSchema.index({ firstName: 1, lastName: 1 });

export default mongoose.model<IContact>("Contact", ContactSchema);
