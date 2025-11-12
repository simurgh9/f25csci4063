import 'package:flutter/material.dart';

import 'package:client/constants/global_variables.dart';

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
            children: [
              Center(
                child: Text('Search', style: GlobalVariables.headingStyle),
              ),
              const SizedBox(height: 24),
              Text(
                'This is where you can do some searching stuff',
                style: GlobalVariables.bodyStyle,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
