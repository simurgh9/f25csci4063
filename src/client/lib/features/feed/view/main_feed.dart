import 'package:client/features/feed/models/post.dart';
import 'package:flutter/material.dart';

import 'package:client/features/feed/services/posts_service.dart';
import 'package:client/features/feed/view/post_card.dart';

class MainFeed extends StatefulWidget {
  static const String routeName = '/mainFeed';
  const MainFeed({super.key});

  @override
  State<MainFeed> createState() => _MainFeedState();
}

class _MainFeedState extends State<MainFeed> {
  final PostsService postsService = PostsService();
  List<Post> posts = [];

  @override
  void initState() {
    super.initState();
    getRecommendedPosts();
  }

  Future<void> getRecommendedPosts() async {
    List<Post> fetchedPosts = await postsService.getRecommendedPosts(
      context: context,
    );
    setState(() {
      posts = fetchedPosts; // might have to append rather than replace
    });
  }

  @override
  Widget build(BuildContext context) {
    // return Scaffold(
    //   body: SafeArea(
    //     child: Padding(
    //       padding: const EdgeInsets.all(8.0),
    //       child: SingleChildScrollView(
    //         child: Column(
    //           children: [
    //             Text('this is where the posts go'),
    //             PostCard(
    //               post: Post(
    //                 title: 'title',
    //                 // author: 'author',
    //                 content: 'post content',
    //               ),
    //             ),
    //           ],
    //         ),
    //       ),
    //     ),
    //   ),
    // );

    return Scaffold(
      body: ListView.builder(
        itemCount: posts.length,
        itemBuilder: (context, index) {
          return PostCard(post: posts[index]);
        },
      ),
    );
  }
}
