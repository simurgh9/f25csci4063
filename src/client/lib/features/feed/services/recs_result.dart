import 'package:client/features/feed/models/post.dart';

class RecommendationsResult {
  final List<Post> posts;
  final String? nextCursor;

  RecommendationsResult({required this.posts, required this.nextCursor});

  bool get hasMore => nextCursor != null;
}
