import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
     // Build the query filter
     const filter = {};
     if (query) {
         filter.title = { $regex: query, $options: "i" }; // Case-insensitive search
     }
     if (userId) {
         filter.uploadedBy = userId;
     }
 
     // Handle sorting
     const sort = { [sortBy]: sortType === "asc" ? 1 : -1 };
 
     // Implement pagination
     const skip = (page - 1) * limit;
 
     // Query the database
     const videos = await Video.find(filter)
         .sort(sort)
         .skip(skip)
         .limit(Number(limit));
 
     // Get total count
     const totalVideos = await Video.countDocuments(filter);
 
     // Send response
     return res.status(200).json(
         new ApiResponse(200, {
             videos,
             totalVideos,
             currentPage: Number(page),
             totalPages: Math.ceil(totalVideos / limit),
         }, "Videos retrieved successfully")
     );
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const videoLocalPath=req.file?.path;
    if(!videoLocalPath){
        throw new ApiError(400,"video not found");
    }

    const videoUploadResponse=await Video.uploadOnCloudinary(videoLocalPath);
    if(!videoUploadResponse.url){
        throw new ApiError(500,"Error while uploading the video");
    }
    
    const video=await Video.create({
          title,
          description,
          videoUploadResponse:videoUploadResponse.url,
    })
    
return res.status(200)
          .json(
            new ApiResponse(200,video,"Video uplaoded sucessfully"),
          )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"Video not found");
    }

    return res.status(200)
               .json(
                new ApiResponse(200,video,"video fetched successfully"),
               )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title,description,thumbnail}=req.body;

    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found");
    }
    
    //check ownership
    if(video.owner.toString()!==req.user._id){
        throw new ApiError(403,"User not allowed to update the video");
    }
    video.title=title || video.title;
    video.description=description || video.description;
    video.thumbnail=thumbnail || video.thumbnail;
     
    //save;
    await video.save();

   return res.status(200)
             .json(
                new ApiResponse(200,video,"video updated successfully"),
             )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found");
    }

    //owner check;
    if(video.owner.toString()!==req.user._id){
        throw new ApiError(403,"forbidden access");
    }

    await video.remove();

    return res.status(200)
              .json(
                new ApiResponse(200,"video deleted Successfully"),
              )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //find video;
    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video not found");
    }

    //check ownership of video;
    if(video.owner.toString()!==req.user._id){
        //if video owner and logged in user are not same then user can not toggle;
        throw new ApiError(403,"Forbidden access");
    }

  video.isPublished=!video.isPublished;
  await video.save();

    return res.status(200)
              .json(
                new ApiResponse(200,"video toggled successfully"),
              )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
