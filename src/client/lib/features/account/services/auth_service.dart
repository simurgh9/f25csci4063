import 'dart:convert';
import 'dart:math';
import 'package:client/common/error_handling.dart';
import 'package:client/providers/profile_provider.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'package:client/constants/global_variables.dart';
import 'package:provider/provider.dart';

class AuthService {
  Future<void> setUser({
    required BuildContext context,
    required String firebaseId,
    required String email,
  }) async {
    http.Response res = await http.get(Uri.parse('$uri/user/$firebaseId'));

    if (res.statusCode == 200) {
      final decoded = jsonDecode(res.body);
      final username = decoded['user']['username'] as String;

      if (context.mounted) {
        Provider.of<ProfileProvider>(
          context,
          listen: false,
        ).setUsername(username);
      }
      return;
    }

    if (res.statusCode == 404) {
      http.Response createRes = await http.post(
        Uri.parse('$uri/user/create'),
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
        body: jsonEncode({
          'fireBaseId': firebaseId,
          'username': usernameFromEmail(email),
        }),
      );

      if (context.mounted) {
        httpErrorHandle(
          response: createRes,
          context: context,
          onSuccess: () {
            final decoded = jsonDecode(createRes.body);
            final username = decoded['response']['username'] as String;
            Provider.of<ProfileProvider>(
              context,
              listen: false,
            ).setUsername(username);
            return;
          },
        );
      }
    }
  }

  String usernameFromEmail(String email) {
    final base = email
        .split('@')
        .first
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9_]'), '');

    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    final rand = Random.secure();
    final suffix = List.generate(
      8,
      (_) => chars[rand.nextInt(chars.length)],
    ).join();

    return '${base}_$suffix';
  }
}
