/**
 * QRShareModal — shows a QR code for a deck, or falls back to file sharing
 * when the payload is too large.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/theme';
import type { ThemeColors } from '@/core/theme';
import { sizes } from '@/constants';
import { generateDeckQR, type QRGenerateResult } from '@/core/services/qrDeckService';
import { exportDeck } from '@/core/services/exportService';

// ── Minimal QR rendering ─────────────────────────────────────────────────────

// The actual QR code image can be rendered by the caller or by a third-party
// library. This modal provides the data string so the host screen can render
// it with any library (react-native-qrcode-svg, etc.).
// For now we show the raw data and a "copy" button as a placeholder.

interface Props {
  visible: boolean;
  deckId: string;
  deckName: string;
  onClose: () => void;
}

export const QRShareModal: React.FC<Props> = ({ visible, deckId, deckName, onClose }) => {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<QRGenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    generateDeckQR(deckId)
      .then((r) => {
        if (!cancelled) setResult(r);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to generate QR.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [visible, deckId]);

  const handleFileFallback = async () => {
    try {
      await exportDeck(deckId);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Export failed.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              Share "{deckName}"
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            {loading && (
              <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.hint}>Preparing QR code…</Text>
              </View>
            )}

            {error && (
              <View style={styles.center}>
                <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {!loading && !error && result && (
              <>
                {result.fits && result.qrData ? (
                  <View style={styles.center}>
                    {/* QR code placeholder — integrate a QR renderer here */}
                    <View style={styles.qrPlaceholder}>
                      <Ionicons name="qr-code-outline" size={120} color={colors.primary} />
                    </View>
                    <Text style={styles.hint}>
                      Scan this QR code with another device running Aura English.
                    </Text>
                    {/* The actual QR data is in result.qrData */}
                  </View>
                ) : (
                  <View style={styles.center}>
                    <Ionicons name="document-outline" size={48} color={colors.text.tertiary} />
                    <Text style={styles.hint}>
                      This deck is too large for a QR code.{'\n'}Use file sharing instead.
                    </Text>
                    <TouchableOpacity style={styles.shareButton} onPress={handleFileFallback}>
                      <Ionicons name="share-outline" size={20} color={colors.text.inverse} />
                      <Text style={styles.shareButtonText}>Share as File</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: sizes.spacing.lg,
    },
    container: {
      width: '100%',
      maxWidth: 380,
      backgroundColor: colors.surface,
      borderRadius: sizes.radius.xl,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: sizes.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      flex: 1,
      fontSize: sizes.fontSize.lg,
      fontWeight: '700',
      color: colors.text.primary,
      marginRight: sizes.spacing.sm,
    },
    body: {
      padding: sizes.spacing.lg,
      minHeight: 250,
    },
    center: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    qrPlaceholder: {
      width: 200,
      height: 200,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceLight,
      borderRadius: sizes.radius.lg,
      marginBottom: sizes.spacing.md,
    },
    hint: {
      fontSize: sizes.fontSize.sm,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: sizes.fontSize.sm * 1.5,
      marginTop: sizes.spacing.sm,
    },
    errorText: {
      fontSize: sizes.fontSize.sm,
      color: colors.error,
      textAlign: 'center',
      marginTop: sizes.spacing.sm,
    },
    shareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: sizes.spacing.sm + 2,
      paddingHorizontal: sizes.spacing.xl,
      borderRadius: sizes.radius.lg,
      marginTop: sizes.spacing.lg,
      gap: sizes.spacing.xs,
    },
    shareButtonText: {
      fontSize: sizes.fontSize.md,
      fontWeight: '600',
      color: colors.text.inverse,
    },
  });
