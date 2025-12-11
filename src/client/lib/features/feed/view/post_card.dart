import 'dart:ui';

import 'package:client/features/feed/models/recommended_post.dart';
import 'package:flutter/material.dart';

import 'package:client/constants/global_variables.dart';

import 'package:client/features/feed/models/post.dart';

class PostCard extends StatelessWidget {
  final Post post;
  final int spoiler;

  const PostCard({super.key, required this.post, this.spoiler = 0});

  PostCard.fromRec({super.key, required RecommendedPost rec})
    : post = rec.post,
      spoiler = rec.spoiler;

  @override
  Widget build(BuildContext context) {
    final isSpoiler = spoiler == 1;

    return Card(
      clipBehavior: Clip.hardEdge,
      child: Stack(
        alignment: Alignment.center,
        children: [
          ImageFiltered(
            imageFilter: isSpoiler
                ? ImageFilter.blur(sigmaX: 5, sigmaY: 5)
                : ImageFilter.blur(sigmaX: 0, sigmaY: 0),
            child: ListTile(
              title: Text(
                '${post.show} - ${post.user}',
                style: GlobalVariables.bodyStyle,
              ),
              subtitle: Text(post.content, style: GlobalVariables.bodyStyle),
            ),
          ),
        ],
      ),
    );
  }
}
