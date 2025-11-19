import 'package:flutter/material.dart';

// screens
import 'package:client/features/account/view/account_screen.dart';
import 'package:client/features/feed/view/main_feed.dart';
import 'package:client/features/posting/view/new_post_screen.dart';
import 'package:client/features/search/view/search_screen.dart';

Route<dynamic> generateRoute(RouteSettings routeSettings) {
  switch (routeSettings.name) {
    case MainFeed.routeName:
      return MaterialPageRoute(
        settings: routeSettings,
        builder: (_) => const MainFeed(),
      );
    case NewPostScreen.routeName:
      return MaterialPageRoute(
        settings: routeSettings,
        builder: (_) => const NewPostScreen(),
      );
    case SearchScreen.routeName:
      return MaterialPageRoute(
        settings: routeSettings,
        builder: (_) => const SearchScreen(),
      );
    case AccountScreen.routeName:
      return MaterialPageRoute(
        settings: routeSettings,
        builder: (_) => const AccountScreen(),
      );
    default:
      return MaterialPageRoute(
        settings: routeSettings,
        builder: (_) =>
            const Scaffold(body: Center(child: Text('Screen does not exist'))),
      );
  }
}
