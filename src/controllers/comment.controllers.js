import { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  //TODO: get all comments for a video

  //steps

  //validate video
  //fetch comments where video=videoId
  //sort comment
  //populate comment owner
  //return res
  if (!videoId) {
    throw new ApiError(400, "bad request");
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  const skip = (pageNumber - 1) * limitNumber;

  if (videoId) {
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid videoId");
    }
  }
  const videoExists = await Video.findById(videoId);
  if (!videoExists) {
    throw new ApiError(404, "video not exists");
  }

  const comments = await Comment.find({ video: videoId })
    .populate("owner", "username")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber);

  return res
    .status(200)
    .json(
      new ApiResponse(200, comments, "video comments fetched successfully")
    );
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  let { content } = req.body;
  // TODO: add a comment to a video

  //steps

  //check authentication
  //validate videoId
  //sanitize new comment
  //extract  and validate comment
  //fetch video from db
  //create comment
  //return res
  if (!req.user) {
    throw new ApiError(401, "Unauthenticated request");
  }
  if (!videoId) {
    throw new ApiError(400, "Bad request");
  }
  if (videoId) {
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid videoId");
    }
  }
  content = content?.trim();
  if (!content) {
    throw new ApiError(400, "Bad request");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video not found");
  }
  const addComment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, addComment, "comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  let { newComment } = req.body;
  // TODO: update a comment

  //steps

  //check authentication
  //validate commentId
  //fetch comment from db
  //if not found -> 404
  //check authorization
  //extract and validate new comment
  //update comment
  //return res
  if (!req.user) {
    throw new ApiError(401, "Unauthenticated request");
  }

  if (!commentId) {
    throw new ApiError(400, "Bad request");
  }

  if (commentId) {
    if (!isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid format");
    }
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "comment not found");
  }

  if (!(comment.owner.toString() == req.user._id.toString())) {
    throw new ApiError(403, "Unauthorized request");
  }

  const trimedNewComment = newComment?.trim();

  if (!trimedNewComment) {
    throw new ApiError(400, "Bad request");
  }
  comment.content = trimedNewComment;
  let NewUpdateComment = await comment.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, NewUpdateComment, "comment updated successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  // TODO: delete a comment

  //steps

  //check authentication
  //valiadate commentId
  //fetch comment from db
  //if not found -> 404
  // check authorization
  //delete comment
  //return res
  if (!req.user) {
    throw new ApiError(401, "Unauthenticated request");
  }

  if (!commentId) {
    throw new ApiError(400, "Bad request");
  }

  if (commentId) {
    if (!isValidObjectId(commentId)) {
      throw new ApiError(400, "Invalid format");
    }
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "comment not found");
  }
  if (!(comment.owner.toString() == req.user._id.toString())) {
    throw new ApiError(403, "Unauthorized request");
  }

  await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };