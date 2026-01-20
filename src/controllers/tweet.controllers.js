import { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  let { content } = req.body;
  //TODO: create tweet

  //steps

  //check authentication
  //Extract and validate tweet content
  //create tweet in db
  //return success res

  if (!req.user) {
    throw new ApiError(401, "Unauthenticated request");
  }

  content = content?.trim();

  if (!content) {
    throw new ApiError(400, "Bad request");
  }
  const tweet = await Tweet.create({ content, owner: req.user._id });

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  // TODO: get user tweets

  //steps

  //check authentication
  //query tweets where owner=req.user._id
  //paginate results
  //return tweets array
  if (!req.user) {
    throw new ApiError(401, "Unauthenticated user");
  }
  const skip = (page - 1) * limit;

  const tweets = await Tweet.find({ owner: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { newContent } = req.body;
  //TODO: update tweet

  //steps

  //check authentication
  //validate tweetId
  //fetch tweet from db
  //if not found -> 404
  //verify ownership owner===req.user._id
  //extract and validated new content
  //update tweet
  //return res

  if (!req.user) {
    throw new ApiError(401, "Unauthenticated user");
  }
  if (!tweetId) {
    throw new ApiError(400, "tweetId not found");
  }
  if (tweetId) {
    if (!isValidObjectId(tweetId)) {
      throw new ApiError(400, "Invalid id format");
    }
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "tweet not found");
  }
  if (!(tweet.owner.toString() == req.user._id.toString())) {
    throw new ApiError(403, "Unauthorized request");
  }
  newContent = newContent?.trim();

  if (!newContent) {
    throw new ApiError(400, "Bad request");
  }

  tweet.content = newContent;
  const newTweet = await tweet.save();

  return res
    .status(200)
    .json(new ApiResponse(200, newTweet, "tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: delete tweet

  //steps
  //check authentication
  //validated tweetId
  //fetch tweet from db
  //if not found -> 404
  //check authorization
  //delete tweet
  //return res

  if (!req.user) {
    throw new ApiError(401, "Unauthenticated user");
  }
  if (!tweetId) {
    throw new ApiError(400, "tweetId not found");
  }
  if (tweetId) {
    if (!isValidObjectId(tweetId)) {
      throw new ApiError(400, "Invalid tweetId");
    }
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "tweet not found");
  }
  if (!(tweet.owner.toString() == req.user._id.toString())) {
    throw new ApiError(403, "Unauthorized request");
  }
  const delTweet = await Tweet.findByIdAndDelete(tweetId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
