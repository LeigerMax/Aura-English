import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/core/theme';
import type { VersionInfo } from '@/core/services/updateService';

interface UpdateModalProps {
  visible: boolean;
  versionInfo: VersionInfo;
  currentVersion: string;
  onUpdate: () => void;
  onDismiss: () => void;
}

export function UpdateModal({
  visible,
  versionInfo,
  currentVersion,
  onUpdate,
  onDismiss,
}: UpdateModalProps) {
  const { colors, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={versionInfo.forceUpdate ? undefined : onDismiss}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              shadowColor: colors.shadow,
            },
          ]}
        >
          {/* Header icon */}
          <View
            style={[styles.iconCircle, { backgroundColor: colors.primaryLight + '22' }]}
          >
            <Text style={styles.iconEmoji}>🚀</Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text.primary }]}>
            New Update Available!
          </Text>

          {/* Version badge */}
          <View style={styles.versionRow}>
            <View style={[styles.badge, { backgroundColor: colors.border }]}>
              <Text style={[styles.badgeText, { color: colors.text.secondary }]}>
                v{currentVersion}
              </Text>
            </View>
            <Text style={[styles.arrow, { color: colors.text.tertiary }]}>→</Text>
            <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.badgeText, { color: colors.primary }]}>
                v{versionInfo.version}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.text.secondary }]}>
            A new version of Aura English is available. Update now to get the latest features and improvements!
          </Text>

          {/* Release notes */}
          {versionInfo.releaseNotes ? (
            <View
              style={[
                styles.notesBox,
                { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderColor: colors.borderLight },
              ]}
            >
              <Text style={[styles.notesLabel, { color: colors.text.tertiary }]}>
                What's new:
              </Text>
              <Text style={[styles.notesText, { color: colors.text.secondary }]}>
                {versionInfo.releaseNotes}
              </Text>
            </View>
          ) : null}

          {/* Buttons */}
          <TouchableOpacity
            style={[styles.updateButton, { backgroundColor: colors.primary }]}
            onPress={onUpdate}
            activeOpacity={0.8}
          >
            <Text style={styles.updateButtonText}>Download Update</Text>
          </TouchableOpacity>

          {!versionInfo.forceUpdate && (
            <TouchableOpacity
              style={styles.laterButton}
              onPress={onDismiss}
              activeOpacity={0.7}
            >
              <Text style={[styles.laterButtonText, { color: colors.text.tertiary }]}>
                Later
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: Math.min(width - 48, 360),
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    elevation: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconEmoji: {
    fontSize: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
  },
  versionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  notesBox: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 13,
    lineHeight: 18,
  },
  updateButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  laterButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  laterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
