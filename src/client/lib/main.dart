import 'package:flutter/material.dart';

import 'package:client/constants/global_variables.dart';
import 'package:client/common/widgets/bottom_bar.dart';
import 'package:client/router.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'The Best App Ever',
      theme: ThemeData(
        scaffoldBackgroundColor: GlobalVariables.backgroundColor,
        colorScheme: const ColorScheme.light(
          primary: GlobalVariables.secondaryColor,
        ),
        appBarTheme: const AppBarTheme(
          elevation: 0,
          iconTheme: IconThemeData(color: Colors.black),
        ),
        useMaterial3:
            false, // check up on what this was supposed to be doing. forgot
      ),
      onGenerateRoute: (settings) => generateRoute(settings),
      home: const BottomBar(
        initialPage: 0,
      ), // temporarily directing immediately to main feed. with need to add auth
    );
  }
}
