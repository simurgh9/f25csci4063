import 'package:flutter/material.dart';

// screens
import 'package:client/features/account/view/login_screen.dart';
import 'package:client/features/account/view/account_screen.dart';
import 'package:client/features/feed/view/main_feed.dart';
import 'package:client/features/posting/view/new_post_screen.dart';
import 'package:client/features/subscriptions/view/subscribed_shows_screen.dart';
import 'package:client/features/subscriptions/view/show_details_screen.dart';

Route<dynamic> generateRoute(RouteSettings routeSettings) {
  switch (routeSettings.name) {
    case LoginScreen.routeName:
      return MaterialPageRoute(
        settings: routeSettings,
        builder: (_) => const LoginScreen(),
      );
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
    case SubscribedShowsScreen.routeName:
      return MaterialPageRoute(
        settings: routeSettings,
        builder: (_) => const SubscribedShowsScreen(),
      );
    case AccountScreen.routeName:
      return MaterialPageRoute(
        settings: routeSettings,
        builder: (_) => const AccountScreen(),
      );
    case ShowDetailsScreen.routeName:
      return MaterialPageRoute(
        settings: routeSettings,
        builder: (_) => const ShowDetailsScreen(),
      );
    default:
      return MaterialPageRoute(
        settings: routeSettings,
        builder: (_) =>
            const Scaffold(body: Center(child: Text('Screen does not exist'))),
      );
  }
}
