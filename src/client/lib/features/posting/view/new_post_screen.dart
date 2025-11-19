import 'package:client/constants/global_variables.dart';
import 'package:client/features/feed/services/posts_service.dart';
import 'package:flutter/material.dart';

class NewPostScreen extends StatefulWidget {
  static const String routeName = '/newPostScreen';
  const NewPostScreen({super.key});

  @override
  State<NewPostScreen> createState() => _NewPostScreenState();
}

class _NewPostScreenState extends State<NewPostScreen> {
  final PostsService postsService = PostsService();

  final _addPostFormKey = GlobalKey<FormState>();
  final TextEditingController _showTitleController = TextEditingController();
  final TextEditingController _postContentController = TextEditingController();

  @override
  void dispose() {
    _showTitleController.dispose();
    _postContentController.dispose();
    super.dispose();
  }

  void createPost() {
    if (_addPostFormKey.currentState!.validate()) {
      postsService.createPost(
        context: context,
        title: _showTitleController.text,
        content: _postContentController.text,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // appBar: AppBar(title: const Text('New Post')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            children: [
              Center(
                child: Text('New Post', style: GlobalVariables.headingStyle),
              ),
              const SizedBox(height: 24),
              Form(
                key: _addPostFormKey,
                child: Column(
                  children: [
                    TextFormField(
                      controller: _showTitleController,
                      decoration: const InputDecoration(
                        labelText: 'Show Title',
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter a title';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _postContentController,
                      decoration: const InputDecoration(
                        labelText: 'Post Content',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 5,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'A lack of thought should be a deadly sin';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: createPost,
                      child: const Text('Create Post'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
