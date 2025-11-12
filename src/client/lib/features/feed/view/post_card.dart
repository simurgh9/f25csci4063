import 'package:flutter/material.dart';

import 'package:client/constants/global_variables.dart';

import 'package:client/features/feed/models/post.dart';

class PostCard extends StatelessWidget {
  const PostCard({super.key, required this.post});
  final Post post;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        children: <Widget>[
          ListTile(
            title: Text(
              '${post.show} - ${post.user}',
              style: GlobalVariables.bodyStyle,
            ),
            subtitle: Text(post.content, style: GlobalVariables.bodyStyle),
          ),
        ],
      ),
    );
  }
}
