import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'package:client/constants/global_variables.dart';
import 'package:client/common/error_handling.dart';
import 'package:client/common/utils.dart';

import 'package:client/features/feed/models/post.dart';

import 'package:client/providers/profile_provider.dart';

import 'package:client/common/widgets/bottom_bar.dart';
import 'package:provider/provider.dart';

class PostsService {
  Future<List<Post>> getRecommendedPosts({
    required BuildContext context,
  }) async {
    try {
      bool recsFound = false;
      Map<String, dynamic>? recsResponse;

      http.Response res = await http.get(
        Uri.parse(
          '$uri/post/recommendations?limit=5&cursor=2025-10-30T20:00:00Z&userId=1',
        ),
      ); // temporary. for testing purposes

      if (context.mounted) {
        httpErrorHandle(
          response: res,
          context: context,
          onSuccess: () {
            recsFound = true;
            recsResponse = jsonDecode(res.body) as Map<String, dynamic>;
          },
        );
      }

      if (!recsFound) {
        debugPrint('recs not found');
        return [];
      }

      final List<dynamic> recs =
          recsResponse?['recommendations'] as List<dynamic>;

      final ids = recs
          .map((rec) => rec is Map<String, dynamic> ? rec['id'] : rec)
          .map((id) => id.toString())
          .toList();

      final posts = Future.wait(
        ids.map((id) => getPost(postId: id, context: context)),
      );

      return posts;
    } catch (error) {
      if (context.mounted) {
        showSnackBar(context, error.toString());
      }

      return [];
    }
  }

  Future<List<Post>> getUserPosts({required BuildContext context}) async {
    try {
      bool postsFound = false;
      Map<String, dynamic>? postsResponse;

      http.Response res = await http.get(
        Uri.parse('$uri/user/posts/1'), // temporary. for testing purposes
      );

      if (context.mounted) {
        httpErrorHandle(
          response: res,
          context: context,
          onSuccess: () {
            postsFound = true;
            postsResponse = jsonDecode(res.body) as Map<String, dynamic>;
          },
        );
      }

      if (!postsFound) {
        debugPrint('user posts not found');
        return [];
      }

      final List<dynamic> postsList = postsResponse?['posts'] as List<dynamic>;

      final posts = postsList
          .map((postMap) => Post.fromMap(postMap as Map<String, dynamic>))
          .toList();

      return posts;
    } catch (error) {
      if (context.mounted) {
        showSnackBar(context, error.toString());
      }

      return [];
    }
  }

  Future<Post> getPost({
    required String postId,
    required BuildContext context,
  }) async {
    try {
      bool postFound = false;
      Map<String, dynamic>? postResponse;

      http.Response res = await http.get(Uri.parse('$uri/post/$postId'));

      if (context.mounted) {
        httpErrorHandle(
          response: res,
          context: context,
          onSuccess: () {
            postFound = true;
            postResponse = jsonDecode(res.body) as Map<String, dynamic>;
          },
        );
      }

      if (!postFound) {
        throw Exception('Failed to load post $postId');
      }

      return Post.fromMap(postResponse?['post']!);
    } catch (error) {
      rethrow;
    }
  }

  void createPost({
    required BuildContext context,
    required String title,
    required String content,
  }) async {
    try {
      http.Response res = await http.post(
        Uri.parse('$uri/post/create'),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode({
          'userId': 1, // temporary. for testing purposes
          'showTitle': title,
          'content': content,
        }),
      );

      if (context.mounted) {
        httpErrorHandle(
          response: res,
          context: context,
          onSuccess: () {
            showSnackBar(context, 'Post created successfully!');
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(
                builder: (context) => const BottomBar(initialPage: 1),
              ),
            );

            Provider.of<ProfileProvider>(
              context,
              listen: false,
            ).refreshUserPosts(context);
          },
        );
      }
    } catch (error) {
      if (context.mounted) {
        showSnackBar(context, error.toString());
      }
    }
  }
}
