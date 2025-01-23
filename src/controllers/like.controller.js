import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId){
        throw new ApiError(400,"Video Id required");
    }

    const user=req.user?._id;
    if(!user){
        throw new ApiError(404,"User is missing");
    }
    // Step 2: Check if the user has already liked the video
    const existingLike=await Like.findOne({video:videoId,likedBy:user});
    if(existingLike){
        await existingLike.remove();
        return res.status(200)
                  .json(
                    new ApiResponse(200,null,"Liked removed Successfully"),
                  )
    }else{
        //not liked;
           newLike=new Like({
            video:videoId,
            likedBy:user,
        })
        await newLike.save();

        return res.status(200)
                   .json(
                    new ApiResponse(200,newLike,"Video liked Successfully")
                   )
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId){
        throw new ApiError(400,"Comment Id required");
    }

    const user=req.user?._id;
    if(!user){
        throw new ApiError(403,"User is missing");
    }
    //find existing like commnet ;
    const existingLikeComment=await Like.findOne({comment:commentId,likedBy:user});
    if(!existingLikeComment){
        //user not like the comment now like the comment;
        newCommentLike=new Like({
            comment:commentId,
            likedBy:user,
        })
        await newCommentLike.save();

        return res.status(200)
                   .json(
                    new ApiResponse(200,newCommentLike,"User like comment Successfully")
                   )

    } else{
        await existingLike.remove();
        return res.status(200)
                  .json(
                    new ApiResponse(200,null,"user removed the liked")
                  )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId){
        throw new ApiError(400,"Tweet Id required");
    }

    const user=req.user?._id;
    if(!user){
        throw new ApiError(403,"User is missing");
    }
    //find existing like commnet ;
    const existingLikeTweet=await Like.findOne({tweet:tweetId,likedBy:user});
    if(!existingLikeTweet){
        //user not like the comment now like the comment;
        newTweetLike=new Like({
            tweet:tweetId,
            likedBy:user,
        })
        await newTweetLike.save();

        return res.status(200)
                   .json(
                    new ApiResponse(200,newTweetLike,"User like tweet Successfully")
                   )

    } else{
        await existingLikeTweet.remove();
        return res.status(200)
                  .json(
                    new ApiResponse(200,null,"user removed the like successfully ")
                  )
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId=req.user?._id;
    if(!userId){
        throw new ApiError(400,"UserId required");
    }

    const likedVideos=await Like.find({
           likedBy:userId,
           videos:{
             $exists:true,
           }.populate("video")
    })

    // Check if there are no liked videos
    if (likedVideos.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], "No liked videos found")
        );
    }

    //return liked videos;
    return res.status(200)
              .json(
                new ApiResponse(200,likedVideos,"All liked videos fetched successfully")
              )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}

