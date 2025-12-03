import 'package:flutter/material.dart';

import 'package:client/features/feed/services/posts_service.dart';
import 'package:client/features/feed/models/post.dart';

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
  bool get wantKeepAlive => true; // maintain state when switching tabs so posts don't disappear

  final PostsService postsService = PostsService();

  final ScrollController _scrollController = ScrollController();

  List<Post> posts = [];

  bool _initialLoaded = false;
  bool _isInitialLoading = true;
  bool _isLoading = false;
  bool _hasMore = true;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    _loadInitial();
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (!_hasMore || _isLoading) return;

    // load more posts when near the bottom
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      _loadMore();
    }
  }

  Future<void> _loadInitial() async {
    if (_initialLoaded) return;
    _initialLoaded = true;

    await getRecommendedPosts();

    setState(() {
      _isInitialLoading = false;
    });
  }

  Future<void> _loadMore() async {
    setState(() {
      _isLoading = true;
    });

    await getRecommendedPosts();

    setState(() {
      _isLoading = false;
    });
  }

  Future<void> getRecommendedPosts() async {
    List<Post> fetchedPosts = await postsService.getRecommendedPosts(
      context: context,
    );
    setState(() {
      if (fetchedPosts.isEmpty) {
        _hasMore = false;
      } else {
        posts += fetchedPosts;
      }
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
                child: _isInitialLoading && posts.isEmpty
                    // initial progress wheel
                    ? const Center(child: CircularProgressIndicator())
                    : ListView.builder(
                        controller: _scrollController,
                        itemCount: posts.length + (_isLoading ? 1 : 0),
                        itemBuilder: (context, index) {
                          if (_isLoading && index == posts.length) {
                            return const Padding(
                              padding: EdgeInsets.symmetric(vertical: 16.0),
                              child: Center(child: CircularProgressIndicator()),
                            );
                          }

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
