import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'package:client/common/error_handling.dart';
import 'package:client/constants/global_variables.dart';
import 'package:client/common/utils.dart';

import 'package:client/features/feed/models/post.dart';

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
}
