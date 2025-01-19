import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content}=req.body;
    const userId= req.user._id;

    if(!(content || typeof content!='string')){
       throw new ApiError(404,"Content not found or not string");
    }

    const user=await User.findById(userId);
    if(!user){
        throw new ApiError(404,"User Not found or Invalid User");
    }

    //create tweet;
    const tweet= Tweet.create({
        content:content.trim(),
        author:userId,
    });

    return res.status(200)
              .json(
                new ApiResponse(200, user, "Tweet created Successfully"),
              )
})

const getUserTweets = asyncHandler(async (req, res) => {

    // TODO: get user tweets
    const userId=req.user._id;
    //validate user;
    const user=await User.findById(req.user._id);
    if(!user){
        throw new ApiError(400,"User not found");
    }

    const tweets=await Tweet.find({author:userId}).sort({createdAt:-1}); //most recest appears on top;

    return res.status(200)
              .json(
                new ApiResponse(200, tweets,"tweets fetched successfully"),
              )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId}=req.params;
    const {content}=req.body;

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Inavlid Tweet Id");
    }

    const tweet=await Tweet.findById(tweetId);

    //check ownership;
    if(tweet.owner.toString()!=req.user._id){
        throw new ApiError(400,"Invalid user");
    }

    //update the content;
    tweet.content=content;
    await tweet.save();

    return res.status(200)
              .json(
                new ApiResponse(200,tweet,"tweet updated successfully"),
              )

});

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req.params;

    //validate tweetid;
    if(!(isValidObjectId(tweetId))){
       throw new ApiError(400,"Invalid tweet id");
    }

    const tweet=await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404,"No tweet found");
    }

    //check ownership;
    if(tweet.author.toString()!=req.user._id){
        throw new ApiError(403,"User not allowed to delete this tweet");
    }

    await tweet.remove();

    return res.status(200)
               .json(
                 new ApiResponse(200,"Tweet deleted successfully")
               )

});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
