import 'package:flutter/material.dart';
import 'package:client/constants/global_variables.dart';

class ShowCard extends StatelessWidget {
  final String title;
  final VoidCallback onTap;

  const ShowCard({super.key, required this.title, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        child: ListTile(title: Text(title, style: GlobalVariables.bodyStyle)),
      ),
    );
  }
}
