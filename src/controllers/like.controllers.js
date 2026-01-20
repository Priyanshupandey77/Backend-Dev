import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video

  //steps

  //check authentication
  //extract and validate videoId
  //check if like already exists (user + video)
  //if exists -> delete it (unlike)
  //else -> create it (like)
  //return current res
  if (!req.user) {
    throw new ApiError(401, "Unauthenticated request");
  }
  if (!videoId) {
    throw new ApiError(400, "videoId is required");
  }
  if (videoId) {
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid format");
    }
  }
  const likExists = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });
  let isLiked;
  if (likExists) {
    await likExists.deleteOne();
    isLiked = false;
  } else {
    await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });
    isLiked = true;
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked }, "video like toggled"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  //steps

  //check authentication
  //extract and validate commentId
  //check if commentlike already exists (user + comment)
  //if exists delete it(unlike)
  //else create it (like)
  //return res
  if (!req.user) {
    throw new ApiError(401, "Unauthenticated request");
  }
  if (!commentId) {
    throw new ApiError(400, "commentId is required");
  }
  if (commentId) {
    if (!isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid format");
    }
  }
  const commentLikeExists = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });
  let isLiked;
  if (commentLikeExists) {
    await commentLikeExists.deleteOne();
    isLiked = false;
  } else {
    await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
    isLiked = true;
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, { isLiked }, "comment like toggled successfully")
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  //steps

  //check authentication
  //extract and validate tweetId
  //check if tweetlike already exists (user + tweet)
  //if exists delete it (unlike)
  //else create it (like)
  //return res

  if (!req.user) {
    throw new ApiError(401, "Unauthenticated user");
  }
  if (!tweetId) {
    throw new ApiError(400, "tweetId is required");
  }
  if (tweetId) {
    if (!isValidObjectId(tweetId)) {
      throw new ApiError(400, "Invalid format");
    }
  }
  const tweetLikeExists = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });
  let isLiked;
  if (tweetLikeExists) {
    await tweetLikeExists.deleteOne();
    isLiked = false;
  } else {
    await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    isLiked = true;
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { isLiked }, "comment like toggled"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  //TODO: get all liked videos

  //steps
  //check authentication
  //fetch likes where likedBy = req.user._id and videos exists
  //populate video details from like
  //paginate reulsts
  //return list of videos
  if (!req.user) {
    throw new ApiError(401, "Unauthenticated user");
  }
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const likedVideos = await Like.find({
    likedBy: req.user._id,
    video: { $exists: true, $ne: null },
  })
    .populate("video", "_id title thumbnail owner")
    .skip(skip)
    .limit(limitNumber);

  const videos = likedVideos.map((like) => like.video);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "liked videos fetched successfully"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
