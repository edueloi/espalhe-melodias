/**
 * Design System Theme Export
 * Centraliza todos os tokens de design
 */

export {
  BREAKPOINTS,
  MEDIA,
  DeviceType,
  useCurrentBreakpoint,
  useDeviceType,
  useOrientation,
  useIsTouchDevice,
  type BreakpointKey,
} from './breakpoints';

export {
  SPACING,
  CONTAINER_PADDING,
  GAP,
  SECTION_PADDING,
  MARGIN,
  SIDEBAR_SPACING,
  HEADER_SPACING,
  CONTENT_SPACING,
  TYPOGRAPHY_SPACING,
  getPaddingClasses,
  getGapClasses,
  type SpacingKey,
} from './spacing';

export {
  TYPOGRAPHY,
  TYPOGRAPHY_CLASSES,
  ICON_SIZES,
  TRUNCATE,
  LINE_HEIGHT,
  LETTER_SPACING,
  FONT_WEIGHT,
} from './typography';

/**
 * Quick reference para componentes
 */
export const RESPONSIVE_SIZES = {
  // Sidebar
  sidebarWidth: 'w-72 lg:w-72',
  sidebarMinWidth: 'min-w-[288px]',

  // Main content area
  mainAreaPadding: 'px-3 sm:px-4 md:px-6 lg:px-8',

  // Modal
  modalWidth: 'w-full sm:w-[95vw] md:max-w-lg lg:max-w-2xl',
  modalHeight: 'max-h-[90vh] sm:max-h-[85vh]',

  // Input/Button height
  inputHeightCompact: 'h-8 sm:h-9',
  inputHeightDefault: 'h-9 sm:h-10',
  inputHeightLarge: 'h-10 sm:h-11',

  // Drawer (mobile menu)
  drawerWidth: 'w-72',
  drawerMaxWidth: 'max-w-xs',
} as const;
