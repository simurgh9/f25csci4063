import 'package:client/features/feed/models/post.dart';
import 'package:client/features/feed/services/posts_service.dart';
import 'package:flutter/material.dart';

class ProfileProvider extends ChangeNotifier {
  final PostsService postsService = PostsService();

  List<Post> userPosts = [];

  String? username;

  void setUsername(String newUsername) {
    username = newUsername;
    notifyListeners();
  }

  Future<void> refreshUserPosts(BuildContext context) async {
    userPosts = await postsService.getUserPosts(context: context);
    notifyListeners();
  }

  void clear() {
    username = null;
    userPosts = [];
    notifyListeners();
  }
}
