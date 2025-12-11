import 'package:client/features/feed/models/recommended_post.dart';

class RecommendationsResult {
  final List<RecommendedPost> posts;
  final String? nextCursor;

  RecommendationsResult({required this.posts, required this.nextCursor});

  bool get hasMore => nextCursor != null;
}
