import 'package:client/features/feed/models/post.dart';

class RecommendedPost {
  final Post post;
  final int spoiler; // 0 or 1

  RecommendedPost({required this.post, required this.spoiler});
}
