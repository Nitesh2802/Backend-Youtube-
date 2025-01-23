import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!name || !description){
        throw new ApiError(404,"No playslist name and description wer given");
    }

    const userId=req.user?._id;
    if(!userId){
        throw new ApiError(404,"User not authenticated");
    }

    const existingPlaylist=await Playlist.findOne({name,owner:userId});
    if(existingPlaylist){
        throw new ApiError(404,"Playlist already exist");
    }

    const newPlaylist=new Playlist({
        name,
        description,
        owner:userId,
        videos:[],  //empty array;
    })

    await newPlaylist.save();

    return res.status(201)
            .json(
                new ApiResponse(201,newPlaylist,"New Playlist created Successfully"),
            )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "UserId is required.");
    }

    const playlists = await Playlist.find({ owner: userId });
    if (!playlists || playlists.length === 0) {
        throw new ApiError(404, "No playlists found for this user.");
    }

    return res.status(200).json(
        new ApiResponse(200, playlists, "Playlists fetched successfully.")
    );
});


const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id;
    if(!playlistId){
        throw new ApiError(400,"Invalid Playlist Id");
    }

    const playlist=await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError("404","No playlist Found");
    }

    return res.status(200)
            .json(
                new ApiResponse(200,playlist,"Playlist Fetched Successfully"),
            )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist ID or video ID is missing.");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "No playlist found.");
    }

    // Authenticate if the user is the owner of the playlist
    if (playlist.owner.toString() !== req.user?._id) {
        throw new ApiError(403, "User is not authorized to modify this playlist.");
    }

    // Add video to the playlist
    if (!playlist.videos.includes(videoId)) {
        playlist.videos.push(videoId);
        await playlist.save();
    }

    return res.status(200).json(
        new ApiResponse(200, playlist, "Video added to playlist successfully.")
    );
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!playlistId && !videoId){
        throw new ApiError(400,"Playlist or Video is missing");
    }

    const playlist=await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Playlist is missing");
    }

    //check if owner is deleting or not;
    if(playlist.owner.toString()!==req.user?._id){
        throw new ApiError(403,"User is not authorized to modify this playlist");
    }

    if(!playlist.videos.includes(videoId)){
        throw new ApiError(404,"Video not found");
    }
    
    // Remove the video from the playlist
    playlist.videos.pull(videoId);
    await playlist.save();

    return res.status(200)
              .json(
                new ApiResponse(200,playlist,"Video deleetd successfully"),
              )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId){
        throw new ApiError(400,"Playlist Id required");
    }

    const playlist=await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Playlist is missing");
    }
   //check for owner;
   if(playlist.owner.toString!==req.user?._id){
     throw new ApiError(404,"User is not authenticated");
   }

   await playlist.remove();

   return res.status(200)
             .json(
                new ApiResponse(200,null,"Playlist removed successfully")
             )
    
})
const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!playlistId){
        throw new ApiError(400,"Playlist Id is required");
    }

    const playlist=await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Playlist is missing");
    }

    // Check if the user is the owner of the playlist
    if (playlist.owner.toString() !== req.user?._id) {
        throw new ApiError(403, "User is not authorized to update this playlist.");
    }
    
    // Update only the fields that were provided in the request
    let updated=false;
    if(name && name!==playlist.name){
        playlist.name=name;
        updated=true;
    }

    if(description && playlist.description!==description){
        playlist.description=description;
        updated=true;
    }

    if(updated){
        await playlist.save();
        return res.status(200)
        .json(
           new ApiResponse(200,playlist,"Playlist modified Successfully"),
        )
    }else{
        return res.status(400)
                .json(400,null,"No Changes Detected")
    }

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
