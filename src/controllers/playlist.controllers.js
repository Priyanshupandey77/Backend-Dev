import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist

  //steps

  //check authentication
  //extarct and validate name and desc
  //create playlist with owner=req.user._id
  //return res
  if (!req.user) {
    throw new ApiError(401, "Unauthenticated user");
  }
  name = name?.trim();
  description = description?.trim();
  if (!name) {
    throw new ApiError(400, "Playlist name is required");
  }
  const playlist = await Playlist.create({
    owner: req.user._id,
    name,
    description,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists

  //steps

  //check authentication
  //extract and validate userId
  //fetch playlist from db
  //return res

  if (!req.user) {
    throw new ApiError(401, "Unauthenticated user");
  }
  if (!userId) {
    throw new ApiError(400, "userId is required");
  }
  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid format");
    }
  }
  const playlist = await Playlist.find({
    owner: userId,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  //steps

  //check authentication
  //extract and validate playlistId
  //fetch playlist from db  by playlistId
  //return res

  if (!req.user) {
    throw new ApiError(401, "Unauthenticated  user");
  }
  if (!playlistId) {
    throw new ApiError(400, "playlistId is required");
  }
  if (playlistId) {
    if (!isValidObjectId(playlistId)) {
      throw new ApiError(400, "Invalid format");
    }
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist fetched successfully"));
});

//add videos in the playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  //steps

  //check authentication
  //extract and validate playlistId and videoId
  //fetch playlist by playlistId  from db
  //if not found -> 404
  //check authorization
  //check if video already exists
  //add videoId to playlist.videos
  //save playlist
  //return res

  if (!req.user) {
    throw new ApiError(401, "Unauthenticated user");
  }
  if (!(playlistId && videoId)) {
    throw new ApiError(400, "playlistId and videoId are required");
  }
  if (playlistId) {
    if (!isValidObjectId(playlistId)) {
      throw new ApiError(400, "Invalid format");
    }
  }
  if (videoId) {
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid format");
    }
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }
  if (!(playlist.owner.toString() == req.user._id.toString())) {
    throw new ApiError(403, "Unauthorized request");
  }
  const videoExists = playlist.videos.some((vid) => vid.toString() === videoId);
  if (videoExists) {
    throw new ApiError(400, "video is already in the playlist");
  }
  playlist.videos.push(videoId);
  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "video added to playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist

  //steps

  //check authentication
  //extract and validate playlist and videoId
  //fetch playlist by playlistId from db
  //if not found -> 404
  //check authorization
  //check if video exists inside  playlist
  //remove videoId from playlist.videos
  //save playlist
  //return res

  if (!req.user) {
    throw new ApiError(401, "Unauthenticated user");
  }
  if (!(playlistId && videoId)) {
    throw new ApiError(400, "playlistId and videoId is required");
  }
  if (playlistId) {
    if (!isValidObjectId(playlistId)) {
      throw new ApiError(400, "Invalid format");
    }
  }
  if (videoId) {
    if (!isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid format");
    }
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }
  if (!(playlist.owner.toString() == req.user._id.toString())) {
    throw new ApiError(403, "Unauthorized request");
  }

  const videoExists = playlist.videos.some((vid) => vid.toString() === videoId);
  if (!videoExists) {
    throw new ApiError(400, "video not found in the playlist");
  }
  playlist.videos = playlist.videos.filter((vid) => vid.toString() !== videoId);
  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "video remove from playlist successfully")
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist

  //steps

  //check authentication
  //extract and validate playlistId
  //fetch playlist from db
  //if not found -> 404
  //check authorization
  //delete playlist
  //return res

  if (!req.user) {
    throw new ApiError(401, "Unauthenticated user");
  }
  if (!playlistId) {
    throw new ApiError(400, "playlistId is required");
  }
  if (playlistId) {
    if (!isValidObjectId(playlistId)) {
      throw new ApiError(400, "Invalid format");
    }
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }
  if (!(playlist.owner.toString() == req.user._id.toString())) {
    throw new ApiError(403, "Unauthorized request");
  }
  const delPlaylist = await Playlist.findByIdAndDelete(playlistId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  let { name, description } = req.body;
  //TODO: update playlist

  //steps

  //check authentication
  //extract and validate playlistId
  //extract and validate name and desc
  //fetch playlist  from db
  // if not found -> 404
  //check authorization
  //update playlist
  //return res
  if (!req.user) {
    throw new ApiError(401, "Unauthenticated user");
  }
  if (!playlistId) {
    throw new ApiError(400, "playlistId is required");
  }
  
  if (playlistId) {
    if (!isValidObjectId(playlistId)) {
      throw new ApiError(400, "Invalid format");
    }
  }
  name = name?.trim();
  description = description?.trim();

  if (!name && !description) {
    throw new ApiError(400, "Nothing to update");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "playlist not found");
  }
  if (!(playlist.owner.toString() == req.user._id.toString())) {
    throw new ApiError(403, "Unauthorized request");
  }

  if(name) playlist.name = name;
  if (description) playlist.description = description;

  await playlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
