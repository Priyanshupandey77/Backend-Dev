import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const { channelId } = req.params;

  //steps
  //check authentication
  //identify channelId
  //total videos count
  //total views
  //total subscriber count
  //Total likes on channel videos
  //return combined stats object
  if (!req.user) {
    throw new ApiError(401, "Unauthenticated user");
  }
  if (!channelId) {
    throw new ApiError(400, "channelId is required");
  }
  if (channelId) {
    if (!isValidObjectId(channelId)) {
      throw new ApiError(400, "Invalid format");
    }
  }
  const totalVideos = await Video.countDocuments({
    owner: channelId,
    isPublished: true,
  });
  const viewsAgg = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
        isPublished: true,
      },
    },
    {
      $group: {
        _id: null,
        totalViews: { $sum: "$views" },
      },
    },
  ]);
  const totalViews = viewsAgg[0]?.totalViews || 0;

  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  const likesAgg = await Like.aggregate([
    {
      $match: {
        video: { $exists: true, $ne: null },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
      },
    },
    { $unwind: "$video" },
    {
      $match: {
        "video.owner": new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $group: {
        _id: null,
        totalLikes: { $sum: 1 },
      },
    },
  ]);
  const totalLikes = likesAgg[0]?.totalLikes || 0;

  const stats = {
    totalVideos,
    totalViews,
    totalSubscribers,
    totalLikes,
  };
  return res
    .status(200)
    .json(new ApiResponse(200, stats, "all data fetched successfully"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: Get all the videos uploaded by the channel

  //steps
  //chech authentication
  //extract and validate channelId
  //check channel exists
  //fetch videos where owner = channelId
  //optionally filter published videos
  //sort videos
  //return res

  if (!req.user) {
    throw new ApiError(401, "Unauthenticated user");
  }
  if (!channelId) {
    throw new ApiError(400, "channelId is required");
  }
  if (channelId) {
    if (!isValidObjectId(channelId)) {
      throw new ApiError(400, " Invalid format");
    }
  }
  const videos = await Video.find({
    owner: channelId,
    isPublished: true,
  }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
