class Post {
  final int id;
  final String content;
  final String timestamp;
  final String user;
  final String show;

  Post({
    required this.id,
    required this.content,
    required this.timestamp,
    required this.user,
    required this.show,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'content': content,
      'timestamp': timestamp,
      'user': user,
      'show': show,
    };
  }

  factory Post.fromMap(Map<String, dynamic> map) {
    return Post(
      id: map['id'] ?? 0,
      content: map['content'] ?? '',
      timestamp: map['timestamp'] ?? '',
      user: map['user'] ?? '',
      show: map['show'] ?? '',
    );
  }
}
