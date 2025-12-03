import 'package:flutter/material.dart';

import 'package:firebase_auth/firebase_auth.dart' as auth;

import 'package:client/features/feed/services/posts_service.dart';
import 'package:client/features/feed/models/post.dart';

import 'package:client/constants/global_variables.dart';
import 'package:client/features/feed/view/post_card.dart';

class AccountScreen extends StatefulWidget {
  static const String routeName = '/accountScreen';
  const AccountScreen({super.key});

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen>
    with AutomaticKeepAliveClientMixin<AccountScreen> {
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

    getUserPosts();
  }

  Future<void> getUserPosts() async {
    List<Post> fetchedPosts = await postsService.getUserPosts(context: context);
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
              Text('Profile', style: GlobalVariables.headingStyle),
              const SizedBox(height: 24),
              Text('My Posts', style: GlobalVariables.subHeadingStyle),
              Expanded(
                child: ListView.builder(
                  itemCount: posts.length,
                  itemBuilder: (context, index) {
                    return PostCard(post: posts[index]);
                  },
                ),
              ),
              ElevatedButton(
                // temporary placement
                onPressed: () {
                  auth.FirebaseAuth.instance.signOut();
                },
                child: const Text("Logout"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
