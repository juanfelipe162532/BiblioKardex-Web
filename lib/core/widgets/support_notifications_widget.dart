import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/support_service.dart';
import '../../state/app_providers.dart';
import '../constants/colors.dart';

class SupportNotificationsWidget extends ConsumerStatefulWidget {
  const SupportNotificationsWidget({super.key});

  @override
  ConsumerState<SupportNotificationsWidget> createState() => _SupportNotificationsWidgetState();
}

class _SupportNotificationsWidgetState extends ConsumerState<SupportNotificationsWidget> {
  Timer? _timer;
  Set<String> _known = {};
  bool _running = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _setup());
  }

  void _setup() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 8), (_) => _tick());
    _tick();
  }

  Future<void> _tick() async {
    if (_running) return;
    final user = ref.read(currentUserProvider);
    if (user == null) return;
    _running = true;
    try {
      final svc = ref.read(supportServiceProvider);
      final items = await svc.getNotifications(user.id);
      final unread = items.where((n) => !(n['read'] as bool? ?? false)).toList();
      final newOnes = unread.where((n) => !_known.contains((n['id'] ?? n['_id']).toString())).toList();
      if (newOnes.isNotEmpty && mounted) {
        // register known
        for (final n in newOnes) { _known.add((n['id'] ?? n['_id']).toString()); }
        // play system sound and haptic
        try { await SystemSound.play(SystemSoundType.click); } catch (_) {}
        try { HapticFeedback.mediumImpact(); } catch (_) {}
        // show a small snackbar
        final ctx = context;
        ScaffoldMessenger.of(ctx).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.primary,
            content: Text('${newOnes.first['title'] ?? 'Nueva respuesta de soporte'}', style: const TextStyle(color: Colors.white)),
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } catch (_) {
      // ignore errors silently
    } finally {
      _running = false;
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return const SizedBox.shrink();
  }
}

