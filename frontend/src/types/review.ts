export interface ReviewAuthor {
  id: string;
  fullName: string;
}

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: ReviewAuthor;
}

export interface ReviewResponse {
  review: Review;
}

export interface ReviewListResponse {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}
