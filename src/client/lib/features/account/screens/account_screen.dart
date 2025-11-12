import 'package:flutter/material.dart';

import 'package:client/constants/global_variables.dart';

class AccountScreen extends StatefulWidget {
  static const String routeName = '/accountScreen';
  const AccountScreen({super.key});

  @override
  State<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends State<AccountScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            children: [
              Center(
                child: Text('Profile', style: GlobalVariables.headingStyle),
              ),
              const SizedBox(height: 24),
              Text(
                'This is where you can do some account stuff',
                style: GlobalVariables.bodyStyle,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
