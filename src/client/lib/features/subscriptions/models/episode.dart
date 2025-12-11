class Episode {
  final int id;
  final int season;
  final int number;
  final String title;

  Episode({
    required this.id,
    required this.season,
    required this.number,
    required this.title,
  });

  Map<String, dynamic> toMap() {
    return {'id': id, 'season': season, 'number': number, 'title': title};
  }

  factory Episode.fromMap(Map<String, dynamic> map) {
    return Episode(
      id: map['id'] ?? 0,
      season: map['season'] ?? '',
      number: map['number'] ?? '',
      title: map['title'] ?? '',
    );
  }
}
