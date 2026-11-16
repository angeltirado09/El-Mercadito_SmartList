import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import {
  AppPermissionStatus,
  DevicePermissionsMap,
  DeviceResource,
  getPermissionStatusLabel,
  RESOURCE_METADATA,
} from '../utils/permissions';

interface Props {
  visible: boolean;
  permissions: DevicePermissionsMap;
  onClose: () => void;
  onRequestSingle: (resource: DeviceResource) => Promise<unknown>;
  onRequestAll: () => Promise<unknown>;
}

const RESOURCE_ICONS: Record<DeviceResource, keyof typeof Ionicons.glyphMap> = {
  camera: 'camera-outline',
  mediaLibrary: 'images-outline',
  location: 'location-outline',
  contacts: 'people-outline',
  calendar: 'calendar-outline',
  notifications: 'notifications-outline',
};

const ORDERED_RESOURCES: DeviceResource[] = [
  'camera',
  'mediaLibrary',
  'location',
  'contacts',
  'calendar',
  'notifications',
];

export default function PermissionsModal({
  visible,
  permissions,
  onClose,
  onRequestSingle,
  onRequestAll,
}: Props) {
  const { theme, isDark } = useTheme();

  const deniedPermissions = ORDERED_RESOURCES
    .map((key) => permissions[key])
    .filter((item) => item?.status === 'denied');

  const getBadgeColors = (status: AppPermissionStatus) => {
    switch (status) {
      case 'granted':
        return {
          bg: isDark ? 'rgba(46, 160, 67, 0.25)' : '#d1e7dd',
          text: isDark ? '#7ee787' : '#0f5132',
          border: isDark ? '#2ea043' : '#badbcc',
        };
      case 'denied':
        return {
          bg: theme.dangerContainer,
          text: theme.dangerText,
          border: theme.danger,
        };
      case 'undetermined':
      default:
        return {
          bg: theme.badgeBackground,
          text: theme.badgeText,
          border: theme.border,
        };
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
              shadowColor: theme.shadowColor,
            },
          ]}
        >
          {/* Encabezado del modal */}
          <View style={styles.headerRow}>
            <View style={styles.titleRow}>
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color={theme.text}
              />
              <Text style={[styles.title, { color: theme.text }]}>
                Permisos del Dispositivo
              </Text>
            </View>
            <TouchableOpacity
              testID="close-permissions-modal"
              onPress={onClose}
              style={styles.closeIconBtn}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Estado actual de los recursos para fotos, ubicación del comercio,
            contacto del proveedor y recordatorios en el calendario.
          </Text>

          {/* Alerta clara si hay algún permiso denegado */}
          {deniedPermissions.length > 0 && (
            <View
              testID="denied-permissions-banner"
              style={[
                styles.deniedBanner,
                {
                  backgroundColor: theme.dangerContainer,
                  borderColor: theme.danger,
                },
              ]}
            >
              <Ionicons
                name="warning-outline"
                size={20}
                color={theme.dangerText}
                style={styles.warningIcon}
              />
              <View style={styles.deniedTextWrapper}>
                <Text
                  style={[styles.deniedBannerTitle, { color: theme.dangerText }]}
                >
                  Atención: {deniedPermissions.length}{' '}
                  {deniedPermissions.length === 1
                    ? 'permiso fue rechazado'
                    : 'permisos fueron rechazados'}
                </Text>
                <Text
                  style={[styles.deniedBannerBody, { color: theme.dangerText }]}
                >
                  {deniedPermissions
                    .map((d) => RESOURCE_METADATA[d.resource].deniedMessage)
                    .join(' ')}
                </Text>
              </View>
            </View>
          )}

          {/* Lista de permisos */}
          <ScrollView
            style={styles.listScroll}
            showsVerticalScrollIndicator={false}
          >
            {ORDERED_RESOURCES.map((resourceKey) => {
              const item = permissions[resourceKey];
              if (!item) return null;
              const badge = getBadgeColors(item.status);
              const statusLabel = getPermissionStatusLabel(item.status);

              return (
                <View
                  key={resourceKey}
                  style={[
                    styles.permissionRow,
                    {
                      backgroundColor: theme.surfaceSubtle,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View style={styles.permissionInfo}>
                    <View style={styles.permissionTitleRow}>
                      <Ionicons
                        name={RESOURCE_ICONS[resourceKey]}
                        size={18}
                        color={theme.text}
                      />
                      <Text
                        style={[styles.permissionLabel, { color: theme.text }]}
                      >
                        {item.label}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.permissionDesc,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {item.description}
                    </Text>
                  </View>

                  <View style={styles.permissionActionCol}>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: badge.bg,
                          borderColor: badge.border,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.statusBadgeText, { color: badge.text }]}
                      >
                        {statusLabel}
                      </Text>
                    </View>

                    {item.status !== 'granted' && (
                      <TouchableOpacity
                        testID={`request-permission-${resourceKey}`}
                        style={[
                          styles.requestSingleBtn,
                          { borderColor: theme.text },
                        ]}
                        onPress={() => onRequestSingle(resourceKey)}
                      >
                        <Text
                          style={[
                            styles.requestSingleBtnText,
                            { color: theme.text },
                          ]}
                        >
                          Solicitar
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Botones inferiores */}
          <View style={styles.footerButtons}>
            <TouchableOpacity
              testID="request-all-permissions-btn"
              style={[
                styles.primaryButton,
                { backgroundColor: theme.buttonPrimary },
              ]}
              onPress={onRequestAll}
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  { color: theme.buttonPrimaryText },
                ]}
              >
                Verificar / Solicitar todos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: theme.border }]}
              onPress={onClose}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                Cerrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    maxHeight: '88%',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
  },
  closeIconBtn: {
    padding: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  deniedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  warningIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  deniedTextWrapper: {
    flex: 1,
  },
  deniedBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  deniedBannerBody: {
    fontSize: 12,
    lineHeight: 17,
  },
  listScroll: {
    marginBottom: 14,
  },
  permissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  permissionInfo: {
    flex: 1,
    paddingRight: 10,
  },
  permissionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  permissionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  permissionDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  permissionActionCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  requestSingleBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  requestSingleBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footerButtons: {
    gap: 8,
  },
  primaryButton: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
