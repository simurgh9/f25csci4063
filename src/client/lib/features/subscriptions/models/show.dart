class Show {
  final int id;
  final String title;

  Show({required this.id, required this.title});

  Map<String, dynamic> toMap() {
    return {'id': id, 'title': title};
  }

  factory Show.fromMap(Map<String, dynamic> map) {
    return Show(id: map['id'] ?? 0, title: map['title'] ?? '');
  }
}
