import 'package:flutter/material.dart';

class SearchScreen extends StatefulWidget {
  static const String routeName = '/SearchScreen';
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            children: [Text('This is where you can do some Search stuff')],
          ),
        ),
      ),
    );
  }
}
