import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  //steps

  //check authentication
  //valiadate channelId
  //prevent self-subscription
  //check if subscription already exists
  //if exists -> delete it (unsubscribe)
  //Else -> create it (subscribe)
  //Return current subscription

  if (!req.user) {
    throw new ApiError(401, "Unauthenticated request");
  }
  if (!channelId) {
    throw new ApiError(400, "Bad request");
  }
  if (channelId) {
    if (!isValidObjectId(channelId)) {
      throw new ApiError(400, "Invalid format");
    }
  }

  if (req.user._id.toString() === channelId) {
    throw new ApiError(403, "User subscribed to itself");
  }

  const toggle = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  const isSubscribed = !toggle;

  if (toggle) {
    await toggle.deleteOne();
  } else {
    await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { isSubscribed }, "toggleSubscription performed")
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  //steps

  //check authentication
  // validate channelId
  //fetch channel from db
  //if not found -> 404
  //fetch list of subscriber
  //populate subscriber details
  //return res

  if (!req.user) {
    throw new ApiError(401, "Unauthenticated user");
  }
  if (!channelId) {
    throw new ApiError(400, "Bad request");
  }
  if (channelId) {
    if (!isValidObjectId(channelId)) {
      throw new ApiError(400, "Invalid format");
    }
  }
  const skip = (page - 1) * limit;

  const channel = await User.findById(channelId);

  if (!channel) {
    throw new ApiError(404, "channel not found");
  }
  const subscribers = await Subscription.find({
    channel: channelId,
  })
    .populate("subscriber", "username fullname avatar")
    .skip(skip)
    .limit(limit);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers,
        "channel subscribers fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  //steps

  //check authentication
  //validate subscriberId
  //fetch subscriber(User) from db
  //if not found -> 404
  //fetch list of channel
  //populate channel details
  //return res
  if (!req.user) {
    throw new ApiError(401, "Unauthenticated user");
  }
  if (!subscriberId) {
    throw new ApiError(400, "Bad request");
  }
  if (subscriberId) {
    if (!isValidObjectId(subscriberId)) {
      throw new ApiError(400, "Invalid format");
    }
  }
  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  const skip = (pageNumber - 1) * limitNumber;
  const subscriber = await User.findById(subscriberId);
  if (!subscriber) {
    throw new ApiError(404, "subscriber not found");
  }
  const subscribedChannels = await Subscription.find({
    subscriber: subscriberId,
  })
    .populate("channel", "username fullname avatar")
    .skip(skip)
    .limit(limitNumber);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "list of channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
