import 'package:client/features/feed/models/post.dart';
import 'package:flutter/material.dart';

import 'package:client/features/feed/services/posts_service.dart';

import 'package:client/constants/global_variables.dart';
import 'package:client/features/feed/view/post_card.dart';

class MainFeed extends StatefulWidget {
  static const String routeName = '/mainFeed';
  const MainFeed({super.key});

  @override
  State<MainFeed> createState() => _MainFeedState();
}

class _MainFeedState extends State<MainFeed>
    with AutomaticKeepAliveClientMixin<MainFeed> {
  @override
  bool get wantKeepAlive => true; // maintain state when swithcing tabs so posts don't disappear

  final PostsService postsService = PostsService();

  List<Post> posts = [];

  bool _initialLoaded = false;

  @override
  void initState() {
    super.initState();

    _loadInitial();
  }

  Future<void> _loadInitial() async {
    if (_initialLoaded) return;
    _initialLoaded = true;

    getRecommendedPosts();
  }

  Future<void> getRecommendedPosts() async {
    List<Post> fetchedPosts = await postsService.getRecommendedPosts(
      context: context,
    );
    setState(() {
      posts += fetchedPosts;
    });
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            children: [
              Text('Main Feed', style: GlobalVariables.headingStyle),
              Expanded(
                child: ListView.builder(
                  itemCount: posts.length,
                  itemBuilder: (context, index) {
                    return PostCard(post: posts[index]);
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
