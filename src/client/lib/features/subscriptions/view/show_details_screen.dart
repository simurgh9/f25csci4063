import 'package:client/features/subscriptions/models/episode.dart';
import 'package:client/features/subscriptions/services/subscription_service.dart';
import 'package:flutter/material.dart';

class ShowDetailsScreen extends StatefulWidget {
  static const String routeName = '/showDetails';
  const ShowDetailsScreen({super.key});

  @override
  State<ShowDetailsScreen> createState() => _ShowDetailsScreenState();
}

class _ShowDetailsScreenState extends State<ShowDetailsScreen> {
  final SubscriptionService subscriptionService = SubscriptionService();

  String? showTitle;
  int? currentSeason;
  int? currentEpisodeNumber;
  List<Episode> episodes = [];
  Episode? _selectedEpisode;

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final args = ModalRoute.of(context)?.settings.arguments;
      if (args is Map) {
        final title = args['title'] as String;
        final season = args['season'] as int?;
        final episode = args['episode'] as int?;

        setState(() {
          showTitle = title;
          currentSeason = season;
          currentEpisodeNumber = episode;
        });

        await _loadShowDetails(title);
      }
    });
  }

  _loadShowDetails(String showTitle) async {
    final fetchedEpisodes = await subscriptionService.getShowEpisodes(
      context: context,
      showTitle: showTitle,
    );

    setState(() {
      episodes = fetchedEpisodes;
      if (currentSeason != null && currentEpisodeNumber != null) {
        _selectedEpisode = episodes.firstWhere(
          (ep) =>
              ep.season == currentSeason && ep.number == currentEpisodeNumber,
          orElse: () => episodes.first,
        );
      }
    });
  }

  _subscribeToShow() async {
    if (_selectedEpisode == null) return;

    subscriptionService.subscribeToShow(
      context: context,
      showTitle: showTitle!,
      episode: _selectedEpisode!,
    );
  }

  _unsubscribeFromShow() async {
    if (showTitle == null) return;

    subscriptionService.unsubscribeFromShow(
      context: context,
      showTitle: showTitle!,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(showTitle ?? "Show Details")),
      body: Column(
        children: [
          Expanded(
            child: RadioGroup<Episode>(
              groupValue: _selectedEpisode,
              onChanged: (Episode? value) {
                setState(() {
                  _selectedEpisode = value;
                });
              },
              child: ListView.builder(
                itemCount: episodes.length,
                itemBuilder: (context, index) {
                  final episode = episodes[index];
                  return RadioListTile<Episode>(
                    value: episode,
                    title: Text(episode.title),
                    subtitle: Text(
                      'Season ${episode.season} · Episode ${episode.number}',
                    ),
                  );
                },
              ),
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(16.0),
            child: ElevatedButton(
              onPressed: _selectedEpisode == null
                  ? null
                  : () async {
                      await _subscribeToShow();
                    },
              child: const Text('Subscribe to Show'),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: ElevatedButton(
              onPressed: _selectedEpisode == null
                  ? null
                  : () async {
                      await _unsubscribeFromShow();
                    },
              child: const Text('Unsubscribe from Show'),
            ),
          ),
        ],
      ),
    );
  }
}
