import mongoose from "mongoose";

const manualValuesSchema = new mongoose.Schema(
  {
    customers: {
      type: Number,
      min: 0,
      max: 1_000_000_000,
      default: 20_000,
    },
    products: {
      type: Number,
      min: 0,
      max: 1_000_000_000,
      default: 10_000,
    },
    satisfaction: {
      type: Number,
      min: 0,
      max: 100,
      default: 99,
    },
  },
  { _id: false },
);

const homepageStatisticsSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: "homepage",
    },
    mode: {
      type: String,
      enum: ["automatic", "manual"],
      default: "automatic",
    },
    manualValues: {
      type: manualValuesSchema,
      default: () => ({}),
    },
  },
  { timestamps: true },
);

const HomepageStatistics = mongoose.model(
  "HomepageStatistics",
  homepageStatisticsSchema,
);

export default HomepageStatistics;
