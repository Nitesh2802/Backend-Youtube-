import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!channelId){
        throw new ApiError(404,"channel not found");
    }
    // TODO: toggle subscription
    const userId=req.user?._id;
    const user=await User.findById(userId).select("-password accessToken");
    if(!user){
        throw new ApiError(404,"User not found");
    }

   const existingSubscription= await Subscription.findOne({
       userId:userId,
       channelId:channelId,
   });
   if(!existingSubscription){
       //user not subscribed;
       await Subscription.create({userId:userId, channelId:channelId});
       return res.status(200)
                 .json({message:"Subcribe successfully"})
   }else{
      await Subscription.deleteOne({_id:existingSubscription._id});
      return res.status(200)
                .json({message:"Unsubscribe successfully"})
   }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    //as we know for channels we have to take care of subscriber;
    const {channelId} = req.params

    if(!channelId){
        throw new ApiError(404,"No channel found");
    }

   const subscribers=await Subscription.findById(channelId)
                        .populate("subscriber","-password -accessToken")
                        .exec();

    if(!subscribers || subscribers.length===0){
        throw new ApiError(400,"No subscriber found");
    }

    return res.status(200).json({
        message: "Subscribers fetched successfully",
        subscribers: subscribers.map(sub => sub.subscriber), // Return only the subscriber details
    });
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    //as we know for subscriber we have to take care of channels;
    const { subscriberId } = req.params;
    if(!subscriberId){
        throw new ApiError(404,"No Subscriber found");
    }

    const channelLists = await Subscription.find({ subscriber: subscriberId }).populate("channel");
    if(!channelLists || channelLists.length===0){
        throw new ApiError(400,"No chanee found for this user");
    }

    // Extract and return the channels from the subscriptions
    const channels = channelLists.map(sub => sub.channel);

    return res.status(200)
              .json({
                message:"Channels Fetched Successfully",
                channels:channels,
              })
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}