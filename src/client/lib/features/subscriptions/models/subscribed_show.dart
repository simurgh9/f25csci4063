class SubscribedShow {
  final String title;
  final int seasonNumber;
  final int episodeNumber;

  SubscribedShow({
    required this.title,
    required this.seasonNumber,
    required this.episodeNumber,
  });
  Map<String, dynamic> toMap() {
    return {
      'showTitle': title,
      'season': seasonNumber,
      'episode': episodeNumber,
    };
  }

  factory SubscribedShow.fromMap(Map<String, dynamic> map) {
    return SubscribedShow(
      title: map['showTitle'] ?? '',
      seasonNumber: map['season'] ?? 0,
      episodeNumber: map['episode'] ?? 0,
    );
  }
}
