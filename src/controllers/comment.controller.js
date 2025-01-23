import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    // Step 2: Set up the pagination options
    const options={
        page:parseInt(page,10),
        limit:parseInt(limit,10),
        sort:{createdAt:-1},
    }

    // Step 3: Perform the aggregation with pagination
    const comments=await Comment.aggregatePaginate(
        Comment.aggregate([
            {
                $match:{video:mongoose.Schema.Types.ObjectId(videoId)},
            },
            {
                $lookup:{
                     from:"users",
                     localField:"owner",
                     foreignField:"_id",
                     as:"ownerDetails",
                }
            },
            {
                $unwind: {
                    path: "$ownerDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project:{
                    content:1,
                    createdAt:1,
                    "ownerDetails.name": 1,
                    "ownerDetails.email": 1 // Return only specific fields from the owner
                }
            }
        ]),options
    );

   // Step 4: Check if no comments are found
   if (comments.docs.length === 0) {
    return res.status(200).json(
        new ApiResponse(200, [], "No comments found for this video")
    );
   }

    return res.status(200)
              .json(
                new ApiResponse(200,comments,"Comment fetched Successfully")
              )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId}=req.params;
    const {content}=req.body;

    if(!videoId || !content){
        throw new ApiError(400,"Videoid required or comment missing");
    }

    const video=await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video missing");
    }

    //fetch user for using as owner;
    const userId=req.user?._id
     if(!userId){
        throw new ApiError(403,"User not authenticated");
     }

     //now create comment;
     const newComment= new Comment(
        {
            content,
            video:videoId,
            owner:userId,
        }
     )
     
     await newComment.save();

     return req.status(200)
               .json(
                new ApiResponse(200,newComment,"new comment added successfully")
               )

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {videoId,commentId}=req.params;
    const {content}=req.body;

    if(!videoId || !commentId){
        throw new ApiError(400,"VideoId and CommentId required");
    }

    const comment=await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404,"No comment found");
    }

     // Ensure the comment belongs to the given video
     if (comment.video.toString() !== videoId) {
        throw new ApiError(400, "The comment does not belong to the specified video");
    }

    //authenticate owner ;
    const userId=req.user?._id;
    if(comment.owner.toString()!==userId){
        throw new ApiError(403,"user not authenticated to modify comment");
    }

    //now assign newcomment to old comment;
    comment.content=content ||comment.content;
    await comment.save();

    return res.status(200)
              .json(
                new ApiResponse(200,comment,"Comment updated Successfully"),
              )
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId, videoId } = req.params;

    // Validate required parameters
    if (!commentId || !videoId) {
        throw new ApiError(400, "Both commentId and videoId are required");
    }

    // Find the comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Ensure the comment belongs to the given video
    if (comment.video.toString() !== videoId) {
        throw new ApiError(403, "Comment does not belong to this video");
    }

    // Check if the user is authenticated
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(403, "User authentication is required");
    }

    // Check if the user is the owner of the comment
    if (comment.owner.toString() !== userId) {
        throw new ApiError(403, "User is not authorized to delete this comment");
    }

    // Remove the comment
    await comment.remove();

    // Return success response
    return res.status(200).json(
        new ApiResponse(200, null, "Comment deleted successfully")
    );
});


export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
