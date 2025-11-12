// import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import 'package:client/common/utils.dart';

void httpErrorHandle({
  required http.Response response,
  required BuildContext context,
  required VoidCallback onSuccess,
}) {
  switch (response.statusCode) {
    case 200:
      onSuccess();
      break;
    // add specific error code cases later
    case 500:
      // showSnackBar(context, jsonDecode(response.body)['error']);
      showSnackBar(context, 'hey there is an ERROR');
      break;
    default:
      showSnackBar(context, response.body);
  }
}
