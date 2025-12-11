import 'package:client/features/subscriptions/models/show.dart';
import 'package:client/features/subscriptions/view/show_card.dart';
import 'package:client/features/subscriptions/view/show_details_screen.dart';
import 'package:flutter/material.dart';

import 'package:client/constants/global_variables.dart';

import 'package:client/features/subscriptions/models/subscribed_show.dart';
import 'package:client/features/subscriptions/services/subscription_service.dart';

class SubscribedShowsScreen extends StatefulWidget {
  static const String routeName = '/subscribedShows';
  const SubscribedShowsScreen({super.key});

  @override
  State<SubscribedShowsScreen> createState() => _SubscribedShowsScreenState();
}

class _SubscribedShowsScreenState extends State<SubscribedShowsScreen>
    with AutomaticKeepAliveClientMixin<SubscribedShowsScreen> {
  @override
  bool get wantKeepAlive => true;

  final SubscriptionService subscriptionService = SubscriptionService();

  List<SubscribedShow> subscribedShows = [];
  List<Show> availableShows = [];

  bool _initialLoaded = false;
  bool _showAvailableShows = false;

  final TextEditingController _requestController = TextEditingController();
  bool _requestingShow = false;

  @override
  void initState() {
    super.initState();

    _loadInitial();
  }

  Future<void> _loadInitial() async {
    if (_initialLoaded) return;
    _initialLoaded = true;

    await getUserSubscriptions();
    await getAllShows();
  }

  Future<void> getUserSubscriptions() async {
    List<SubscribedShow> fetchedSubscriptions = await subscriptionService
        .getSubscribedShows(context: context);
    setState(() {
      subscribedShows += fetchedSubscriptions;
    });
  }

  Future<void> getAllShows() async {
    final fetchedShows = await subscriptionService.getAllShows(
      context: context,
    );

    setState(() {
      availableShows = fetchedShows
          .where(
            (show) => !subscribedShows.any(
              (subscribedShow) => subscribedShow.title == show.title,
            ),
          )
          .toList();
    });
  }

  requestShow(String showTitle) {
    subscriptionService.requestShow(context: context, showTitle: showTitle);
  }

  @override
  void dispose() {
    _requestController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            children: [
              Text('My Shows', style: GlobalVariables.headingStyle),
              const SizedBox(height: 24),
              Text('Subscribed Shows', style: GlobalVariables.subHeadingStyle),
              Expanded(
                child: ListView(
                  children: [
                    ...subscribedShows.map(
                      (subscribedShow) => ShowCard(
                        title: subscribedShow.title,
                        onTap: () {
                          Navigator.pushNamed(
                            context,
                            ShowDetailsScreen.routeName,
                            arguments: {
                              'title': subscribedShow.title,
                              'season': subscribedShow.seasonNumber,
                              'episode': subscribedShow.episodeNumber,
                            },
                          );
                        },
                      ),
                    ),

                    const SizedBox(height: 24),

                    ElevatedButton(
                      onPressed: () {
                        setState(() {
                          _showAvailableShows = !_showAvailableShows;
                        });
                      },
                      child: Center(child: Text('Looking for something new?')),
                    ),

                    if (_showAvailableShows) ...[
                      const SizedBox(height: 16),
                      Center(
                        child: Text(
                          'Available Shows',
                          style: GlobalVariables.subHeadingStyle,
                        ),
                      ),
                      const SizedBox(height: 8),
                      ...availableShows.map(
                        (show) => ShowCard(
                          title: show.title,
                          onTap: () {
                            Navigator.pushNamed(
                              context,
                              ShowDetailsScreen.routeName,
                              arguments: {'title': show.title},
                            );
                          },
                        ),
                      ),
                    ],

                    const SizedBox(height: 24),

                    ElevatedButton(
                      onPressed: () {
                        setState(() {
                          _requestingShow = !_requestingShow;
                        });
                      },
                      child: Center(child: Text('Request a Show')),
                    ),

                    if (_requestingShow) ...[
                      const SizedBox(height: 12),

                      // Text field
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: TextField(
                          controller: _requestController,
                          decoration: InputDecoration(
                            labelText: 'Show Title',
                            border: OutlineInputBorder(),
                            hintText: 'Enter the show you want added',
                          ),
                        ),
                      ),

                      const SizedBox(height: 12),

                      // Submit button
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: ElevatedButton(
                          onPressed: () {
                            final text = _requestController.text.trim();
                            if (text.isEmpty) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text("Please enter a show title"),
                                ),
                              );
                              return;
                            }

                            requestShow(text);

                            _requestController.clear();
                            setState(() {
                              _requestingShow = false;
                            });
                          },
                          child: const Text('Submit Request'),
                        ),
                      ),
                    ],
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
