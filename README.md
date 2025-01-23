# YouTube Backend Clone

This project is a backend application inspired by YouTube. It provides core YouTube features such as video upload, user subscriptions, playlists, likes, comments, and more. Additionally, extra features have been added for enhanced functionality. The application is built with Node.js, Express, and MongoDB.

## Features

### Core Features:

#### User Management:
- User Registration and Login (JWT-based Authentication)
- Profile management

#### Video Management:
- Video upload using Multer and Cloudinary
- CRUD operations on videos
- Video streaming

#### Comments and Likes:
- Add, delete, and manage comments on videos
- Like/Dislike functionality for videos and comments

#### Playlist Management:
- Create, update, and delete playlists
- Add and remove videos from playlists

#### Subscription System:
- Subscribe to channels
- Notifications for new uploads from subscribed channels

#### Dashboard:
- View user-specific statistics such as total likes, subscriptions, and watch history

### Additional Features:

#### Custom Middleware:
- Video and image uploads using Multer and Cloudinary
- CORS enabled for secure API requests from different origins

#### Error Handling:
- Centralized error handling with custom API error responses

#### Enhanced Security:
- Input validation using express-validator
- Secure headers using helmet

#### Analytics:
- Track user activity such as views, likes, and comments

## Aggregation Pipeline

MongoDB's **Aggregation Pipeline** is used in this project to perform complex queries efficiently. It is particularly useful for gathering and manipulating data across collections.

### Finding Subscribers of a Particular Channel

The aggregation pipeline is used to query and find the number of subscribers of a particular channel. This is achieved by joining the users' subscription data with the channel information using the `$lookup` operator. The pipeline aggregates the data by counting the number of subscribers for the channel.

### Finding the Number of Channels a User is Subscribed To

We also use the aggregation pipeline to determine how many channels a user has subscribed to. This is done by querying the user's subscription data and performing a count operation to return the total number of channels the user is subscribed to.

### Example Aggregation Pipeline:

```js
// Finding subscribers for a particular channel
db.subscriptions.aggregate([
  { 
    $match: { channelId: "specific_channel_id" } 
  },
  {
    $lookup: {
      from: "users", 
      localField: "userId", 
      foreignField: "_id", 
      as: "subscribers"
    }
  },
  {
    $project: { 
      subscribersCount: { $size: "$subscribers" } 
    }
  }
]);

// Finding the number of channels a user is subscribed to
db.subscriptions.aggregate([
  { 
    $match: { userId: "specific_user_id" } 
  },
  {
    $count: "subscribedChannels"
  }
]);

Installation
Clone the repository:

Install dependencies:
npm install
Set up environment variables:
