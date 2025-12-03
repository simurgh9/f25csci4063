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
  String? _cursor;
  int _startupLoadCount = 0;

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
    if (!_scrollController.hasClients) return;

    final position = _scrollController.position;
    final maxScroll = _scrollController.position.maxScrollExtent;

    if (maxScroll <= 0) return;

    final progress = position.pixels / maxScroll;
    final bool isAtBottom = position.atEdge && position.pixels != 0.0;

    if (progress >= 0.6 || isAtBottom) {
      _loadMore();
    }
  }

  Future<void> _loadInitial() async {
    if (_initialLoaded) return;
    _initialLoaded = true;

    await getRecommendedPosts();

    if (!mounted) return;
    setState(() {
      _isInitialLoading = false;
    });

    _topOffScroll();
  }

  Future<void> _loadMore() async {
    if (_isLoading || !_hasMore || !mounted) return;

    setState(() {
      _isLoading = true;
    });

    await getRecommendedPosts();

    if (!mounted) return;
    setState(() {
      _isLoading = false;
    });
  }

  Future<void> getRecommendedPosts() async {
    if (!_hasMore) return;

    final result = await postsService.getRecommendedPosts(
      context: context,
      cursor: _cursor,
    );

    if (result == null) {
      return;
    }

    if (!mounted) return;
    setState(() {
      if (result.posts.isEmpty || result.nextCursor == null) {
        _hasMore = false;
        debugPrint("No more posts to load.");
      }

      posts += result.posts;
      _cursor = result.nextCursor;
    });
  }

  void _topOffScroll() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || !_scrollController.hasClients) return;

      final maxScroll = _scrollController.position.maxScrollExtent;

      if (maxScroll == 0 && _hasMore && !_isLoading && _startupLoadCount < 3) {
        _startupLoadCount++;
        _loadMore();
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
