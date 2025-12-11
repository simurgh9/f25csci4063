import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'package:client/common/error_handling.dart';
import 'package:client/constants/global_variables.dart';
import 'package:client/common/utils.dart';

import 'package:client/features/subscriptions/models/show.dart';
import 'package:client/features/subscriptions/models/episode.dart';
import 'package:client/features/subscriptions/models/subscribed_show.dart';

class SubscriptionService {
  Future<List<Show>> getAllShows({required BuildContext context}) async {
    try {
      bool showsFound = false;
      Map<String, dynamic>? showsResponse;

      http.Response res = await http.get(Uri.parse('$uri/show/'));

      if (context.mounted) {
        httpErrorHandle(
          response: res,
          context: context,
          onSuccess: () {
            showsFound = true;
            showsResponse = jsonDecode(res.body) as Map<String, dynamic>;
          },
        );
      }

      if (!showsFound) {
        debugPrint('available shows not found');
        return [];
      }

      final List<dynamic> showsList = showsResponse?['shows'] as List<dynamic>;

      final shows = showsList
          .map((showMap) => Show.fromMap(showMap as Map<String, dynamic>))
          .toList();

      return shows;
    } catch (error) {
      if (context.mounted) {
        showSnackBar(context, error.toString());
      }

      return [];
    }
  }

  Future<List<SubscribedShow>> getSubscribedShows({
    required BuildContext context,
  }) async {
    try {
      bool showsFound = false;
      Map<String, dynamic>? showsResponse;

      http.Response res = await http.get(
        Uri.parse('$uri/user/subscriptionInfo/1'),
      ); // temporary userId for testing

      if (context.mounted) {
        httpErrorHandle(
          response: res,
          context: context,
          onSuccess: () {
            showsFound = true;
            showsResponse = jsonDecode(res.body) as Map<String, dynamic>;
          },
        );
      }

      if (!showsFound) {
        debugPrint('subscribed shows not found');
        return [];
      }

      final List<dynamic> showsList =
          showsResponse?['subscriptions'] as List<dynamic>;

      final subscribedShows = showsList
          .map(
            (showMap) =>
                SubscribedShow.fromMap(showMap as Map<String, dynamic>),
          )
          .toList();

      return subscribedShows;
    } catch (error) {
      if (context.mounted) {
        showSnackBar(context, error.toString());
      }

      return [];
    }
  }

  Future<List<Episode>> getShowEpisodes({
    required BuildContext context,
    required String showTitle,
  }) async {
    try {
      bool episodesFound = false;
      Map<String, dynamic>? episodesResponse;

      debugPrint("Fetching episodes for show: $showTitle");

      http.Response res = await http.get(
        Uri.parse('$uri/show/episodes?title=$showTitle'),
      );

      if (context.mounted) {
        httpErrorHandle(
          response: res,
          context: context,
          onSuccess: () {
            episodesFound = true;
            episodesResponse = jsonDecode(res.body) as Map<String, dynamic>;
          },
        );
      }

      if (!episodesFound) {
        debugPrint('episodes not found for show: $showTitle');
        return [];
      }

      final List<dynamic> episodesList =
          episodesResponse?['episodes'] as List<dynamic>;

      final episodes = episodesList
          .map(
            (episodeMap) => Episode.fromMap(episodeMap as Map<String, dynamic>),
          )
          .toList();

      return episodes;
    } catch (error) {
      if (context.mounted) {
        showSnackBar(context, error.toString());
      }

      return [];
    }
  }

  void subscribeToShow({
    required BuildContext context,
    required String showTitle,
    required Episode episode,
  }) async {
    try {
      http.Response res = await http.post(
        Uri.parse('$uri/user/subscriptionInfo'),
        body: jsonEncode({
          'userId': 1, // temporary userId for testing
          'showTitle': showTitle,
          'seasons': episode.season,
          'episode': episode.number,
        }),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
      );

      if (context.mounted) {
        httpErrorHandle(
          response: res,
          context: context,
          onSuccess: () {
            showSnackBar(context, 'Successfully subscribed to $showTitle');
          },
        );
      }
    } catch (error) {
      if (context.mounted) {
        showSnackBar(context, error.toString());
      }
    }
  }

  void unsubscribeFromShow({
    required BuildContext context,
    required String showTitle,
  }) async {
    try {
      http.Response res = await http.post(
        Uri.parse('$uri/user/unsubscribe'),
        body: jsonEncode({
          'userId': 1, // temporary userId for testing
          'showTitle': showTitle,
        }),
        headers: <String, String>{
          'Content-Type': 'application/json; charset=UTF-8',
        },
      );

      if (context.mounted) {
        httpErrorHandle(
          response: res,
          context: context,
          onSuccess: () {
            showSnackBar(context, 'Successfully unsubscribed from $showTitle');
          },
        );
      }
    } catch (error) {
      if (context.mounted) {
        showSnackBar(context, error.toString());
      }
    }
  }
}
