import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart' as auth;
import 'package:firebase_ui_auth/firebase_ui_auth.dart';

import 'package:client/common/widgets/bottom_bar.dart';
import 'package:client/features/account/services/auth_service.dart';

class LoginScreen extends StatelessWidget {
  static const String routeName = '/login';
  const LoginScreen({super.key});

  Future<void> _handleSignIn(BuildContext context) async {
    final user = auth.FirebaseAuth.instance.currentUser;
    if (user == null) return;

    await AuthService().setUser(
      context: context,
      firebaseId: user.uid,
      email: user.email!,
    );

    if (context.mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const BottomBar(initialPage: 0)),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return SignInScreen(
      providers: [EmailAuthProvider()],
      actions: [
        AuthStateChangeAction<UserCreated>((context, state) async {
          await _handleSignIn(context);
        }),
        AuthStateChangeAction<SignedIn>((context, state) async {
          await _handleSignIn(context);
        }),
      ],
    );
  }
}
