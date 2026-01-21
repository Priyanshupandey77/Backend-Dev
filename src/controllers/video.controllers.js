import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  const matchStage = {
    isPublished: true, // only shows published videos
  };

  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid user");
    }
    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }

  if (query) {
    matchStage.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  const sortStage = {};
  if (sortBy) {
    sortStage[sortBy] = sortType === "asc" ? 1 : -1;
  } else {
    sortStage.createdAt = -1;
  }

  const options = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
    sort: sortStage,
  };

  const videos = await Video.aggregatePaginate(
    Video.aggregate([
      {
        $match: matchStage,
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [
            {
              $project: {
                username: 1,
                fullname: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          owner: {
            $first: "$owner",
          },
        },
      },
      {
        $sort: sortStage,
      },
    ]),
    options
  );

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  //steps to publish the video

  //get and validate title and description from req.body
  //ensure the file exists and extract its local path
  //upload video to cloudinary and handle upload  failure
  // create a video document in db with owner=req.user._id
  //return success response with video data
  if (!req.user) {
    throw new ApiError(400, "user not authenticated");
  }

  if (!(title && description)) {
    throw new ApiError(400, "Title and description missing");
  }

const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

if (!thumbnailLocalPath) {
  throw new ApiError(400, "thumbnail file not found");
}
const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
if (!thumbnail) {
  throw new ApiError(500, "thumbnail not uploaded");
}

const videoLocalPath = req.files?.videoFile?.[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "video file not found");
  }

  const video = await uploadOnCloudinary(videoLocalPath);

  if (!video) {
    throw new ApiError(500, "video upload failed");
  }

  const videodocs = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    duration: video.duration,
    title,
    description,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, videodocs, "video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  //steps

  //validate videoId
  //fetched published video from database
  //populate the owner details
  //handle not found case
  //return  success response

  if (!videoId) {
    throw new ApiError(400, "videoId not found");
  }

  if (videoId) {
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "invalid videoId");
    }
  }

  const videos = await Video.findOne({
    _id: videoId,
    isPublished: true,
  }).populate("owner", "username fullname avatar");

  if (!videos) {
    throw new ApiError(404, "video does not exists");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description, thumbnail } = req.body;
  //TODO: update video details like title, description, thumbnail

  //steps 

  // Extract title, description, thumbnail from req.body 
  //validate videoId 
  //check authentication 
  //fetch video from DB 
  //verify ownership 
  //Prepare update payload 
  //Handle thumbnail upload (if exists) 
  //update video document 
  //return response and video

  if (!req.user) {
    throw new ApiError(401, "user not authenticated");
  }
  if (!videoId) {
    throw new ApiError(400, "bad request no videoId");
  }
  if (videoId) {
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid videoId");
    }
  }

  const videos = await Video.findOne({
    _id: videoId,
    isPublished: true,
  });


  if (!videos) {
    throw new ApiError(404, "video not found" )
  }

  if (!(videos.owner.toString() == req.user._id.toString())) {
    throw new ApiError(403, "user  logged in but not allowed");
  }
  const updateVideoPayload = {};

  if (title) updateVideoPayload.title = title;
  if (description) updateVideoPayload.description = description;
  if  (thumbnail) updateVideoPayload.thumbnail = thumbnail;

  if (!(title || description || thumbnail)) {
    throw new ApiError(400, "bad request");
  }
  
  const video = await Video.findByIdAndUpdate(
    videoId, 
    updateVideoPayload,
    { new: true }
);

  return res
  .status(200)
  .json(
    new ApiResponse(200, video, "update successful")
  );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  
  //steps
  
  //valiadte vedioId
  //check authentication
  //fetch video from db
  //verify ownership
  //delete video
  //return res

  if (!videoId) {
    throw new ApiError(400, "videoId not found")
  }
  if (videoId) {
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid videoId")
    }
  }
  if (!req.user) {
    throw new ApiError(401, "Unauthorized request")
  }
  const video = await Video.findById(videoId)
  if (!video) {
    throw new ApiError(404, "Video not found")
  }
  if (!(video.owner.toString() == req.user._id.toString())) {
    throw new ApiError(403, "Unauthorized request")
  }
  await Video.findByIdAndDelete(videoId);

  return res
  .status(200)
  .json(
    new ApiResponse(200,null, "video deleted successfully")
  )
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  //steps

  //check authentication
  //validate video
  //fetch video
  //if not found -> 404
  //verify ownership
  //toggle isPublished
  // save/update video
  //return res
  if (!req.user) {
    throw new ApiError(401, "user not authenticated")
  }

  if (!videoId) {
    throw new ApiError(400, "videoId not found")
  }
  if (videoId) {
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid videoId")
    }
  }

  const video = await Video.findById(videoId)

  if (!video) {
    throw new ApiError(404, "video not found")
  }

  if (!(video.owner.toString() == req.user._id.toString())) {
    throw new ApiError(403, "Unauthorized request")
  }
  video.isPublished = !video.isPublished
  await video.save();

  
  return res
  .status(200)
  .json(
    new ApiResponse(200,{isPublished: video.isPublished}, "video toggled successfully")
  )
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
