import 'package:flutter/material.dart';

String uri = 'http://localhost:3000';

class GlobalVariables {
  // Colours
  static const secondaryColor = Color.fromRGBO(69, 91, 190, 1);
  static const backgroundColor = Colors.white;
  static const selectedNavBarColor = Color.fromRGBO(69, 91, 190, 1);
  static const unselectedNavBarColor = Colors.black87;

  // TextStyles
  static const TextStyle headingStyle = TextStyle(
    fontSize: 22,
    color: secondaryColor,
  );

  static const TextStyle subHeadingStyle = TextStyle(
    fontSize: 18,
    color: Colors.black,
  );

  static const TextStyle bodyStyle = TextStyle(
    fontSize: 16,
    color: Colors.black,
  );
}
