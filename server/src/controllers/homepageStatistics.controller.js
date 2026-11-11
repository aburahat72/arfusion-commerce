import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Review from "../models/review.model.js";
import HomepageStatistics from "../models/homepageStatistics.model.js";

const DEFAULT_MANUAL_VALUES = {
  customers: 20_000,
  products: 10_000,
  satisfaction: 99,
};

const getSettings = () =>
  HomepageStatistics.findByIdAndUpdate(
    "homepage",
    {
      $setOnInsert: {
        _id: "homepage",
        mode: "automatic",
        manualValues: DEFAULT_MANUAL_VALUES,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

export const calculateSatisfactionPercent = (averageRating) => {
  const rating = Number(averageRating) || 0;
  return Math.round(Math.min(5, Math.max(0, rating)) * 20);
};

const getAutomaticStatistics = async () => {
  const [customers, products, ratingRows] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    Product.countDocuments({ isActive: true }),
    Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]),
  ]);

  return {
    customers,
    products,
    satisfaction: calculateSatisfactionPercent(ratingRows[0]?.averageRating),
  };
};

const getManualValues = (settings) => ({
  customers: settings.manualValues.customers,
  products: settings.manualValues.products,
  satisfaction: settings.manualValues.satisfaction,
});

export const getPublicHomepageStatistics = async (_req, res) => {
  try {
    const settings = await getSettings();
    const statistics =
      settings.mode === "automatic"
        ? await getAutomaticStatistics()
        : getManualValues(settings);

    return res.status(200).json({
      success: true,
      mode: settings.mode,
      statistics,
    });
  } catch (error) {
    console.error("Get Homepage Statistics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load homepage statistics.",
    });
  }
};

export const getAdminHomepageStatistics = async (_req, res) => {
  try {
    const [settings, automaticValues] = await Promise.all([
      getSettings(),
      getAutomaticStatistics(),
    ]);

    return res.status(200).json({
      success: true,
      settings: {
        mode: settings.mode,
        manualValues: getManualValues(settings),
      },
      automaticValues,
    });
  } catch (error) {
    console.error("Get Admin Homepage Statistics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load homepage statistics settings.",
    });
  }
};

export const updateAdminHomepageStatistics = async (req, res) => {
  try {
    const settings = await getSettings();
    settings.mode = req.body.mode;
    settings.manualValues = req.body.manualValues;
    await settings.save();

    const automaticValues = await getAutomaticStatistics();

    return res.status(200).json({
      success: true,
      message: "Homepage statistics updated successfully.",
      settings: {
        mode: settings.mode,
        manualValues: getManualValues(settings),
      },
      automaticValues,
    });
  } catch (error) {
    console.error("Update Homepage Statistics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update homepage statistics.",
    });
  }
};
