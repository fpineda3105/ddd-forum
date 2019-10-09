
import { Post } from "../post";
import { Member } from "../member";
import { Comment } from "../comment";
import { CommentText } from "../commentText";
import { Either, Result, left, right } from "../../../../shared/core/Result";
import { PostVote } from "../postVote";
import { UpvotePostResponse } from "../../useCases/post/upvotePost/UpvotePostResponse";
import { DownvotePostResponse } from "../../useCases/post/downvotePost/DownvotePostResponse";

export class PostService {

  public togglePostDownvote (
    post: Post,
    member: Member,
    existingVotesOnPostByMember: PostVote[]
  ): DownvotePostResponse {

    const existingDownvote: PostVote = existingVotesOnPostByMember
      .find((v) => v.isDownvote());

    const downvoteAlreadyExists = !!existingDownvote;

    if (downvoteAlreadyExists) {
      post.removeVote(existingDownvote);
      return right(Result.ok<void>());
    }

    const downvoteOrError = PostVote
      .createDownvote(member.memberId, post.postId);

    if (downvoteOrError.isFailure) {
      return left(downvoteOrError);
    }

    const downvote: PostVote = downvoteOrError.getValue();
    post.addVote(downvote);

    return right(Result.ok<void>());
    
  }

  public togglePostUpvote (
    post: Post, 
    member: Member, 
    existingVotesOnPostByMember: PostVote[]
  ): UpvotePostResponse {

    const existingUpvote: PostVote = existingVotesOnPostByMember
      .find((v) => v.isUpvote());

    // If already upvoted, remove the upvote
    const upvoteAlreadyExists = !!existingUpvote;

    if (upvoteAlreadyExists) {
      post.removeVote(existingUpvote);
      return right(Result.ok<void>());
    } 

    // If not upvoted, add to votes
    const upvoteOrError = PostVote
      .createUpvote(member.memberId, post.postId);

    if (upvoteOrError.isFailure) {
      return left(upvoteOrError);
    }

    const upvote: PostVote = upvoteOrError.getValue();
    post.addVote(upvote);

    return right(Result.ok<void>());
  }

  public replyToComment (
    post: Post, 
    member: Member, 
    parentComment: Comment, 
    newCommentText: CommentText
  ): Either<Result<any>, Result<void>> {

    const commentOrError = Comment.create({
      memberId: member.memberId,
      text: newCommentText,
      postId: post.postId,
      parentCommentId: parentComment.commentId
    });

    if (commentOrError.isFailure) {
      return left(commentOrError);
    }

    const comment: Comment = commentOrError.getValue();

    post.addComment(comment);

    return right(Result.ok<void>());
  }
}