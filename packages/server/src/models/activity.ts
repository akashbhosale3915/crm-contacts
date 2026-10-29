import mongoose, { Schema } from "mongoose";

import type { ActivityType } from "../../../shared/src";

export type { ActivityType } from "../../../shared/src";

interface IActivity {
  contactId: mongoose.Types.ObjectId;
  type: ActivityType;
  details?: string;
  timestamp: Date;
}

const ActivitySchema = new Schema<IActivity>({
  contactId: { type: Schema.Types.ObjectId, ref: "Contact", required: true },
  type: {
    type: String,
    enum: ["CONTACT_UPDATED", "TAG_ADDED", "TAG_REMOVED"],
    required: true,
  },
  details: { type: String },
  timestamp: { type: Date, default: Date.now },
});

ActivitySchema.index({ contactId: 1, timestamp: -1 });

export default mongoose.model("Activity", ActivitySchema);
