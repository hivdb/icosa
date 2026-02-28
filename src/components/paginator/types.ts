import type React from 'react';

/**
 * Represents a child item in the paginator.
 */
export interface PaginatorChildItem {
  /** Unique name identifier for the item */
  name: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Optional href for the item link */
  href?: string;
  /** Content to display */
  children?: React.ReactNode;
  /** Allow additional properties */
  [key: string]: unknown;
}

/**
 * Props for the main Paginator component.
 */
export interface PaginatorProps {
  /** Whether to use inverse color scheme */
  inverseColor?: boolean;
  /** Optional footnote content displayed below the paginator */
  footnote?: React.ReactNode;
  /** Name of the currently selected item */
  currentSelected?: string;
  /** Optional CSS class name */
  className?: string;
  /** Child items (should be Paginator.Item components) */
  children: React.ReactNode;
}

/**
 * Props for PseudoItem component (placeholder for paginator items).
 */
export interface PseudoItemProps {
  /** Unique name identifier */
  name: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Optional href */
  href?: string;
  /** Content to display */
  children: React.ReactNode;
}

/**
 * Props for individual PaginatorItem component.
 */
export interface PaginatorItemProps {
  /** Index of the item in the list */
  index: number;
  /** Unique name identifier */
  name: string;
  /** Optional href for the link */
  href?: string;
  /** Optional click handler */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  /** Content to display */
  children: React.ReactNode;
  /** Whether this item is currently selected */
  isSelected: boolean;
  /** Whether this item is currently being hovered */
  isHovering?: boolean;
  /** Callback to set the currently hovering item */
  setCurrentHovering: (name: string | null) => void;
}

/**
 * Props for the PaginatorArrow component.
 */
export interface PaginatorArrowProps {
  /** Direction: -1 for backward, 1 for forward */
  direction: number;
  /** Click handler receiving the direction */
  onClick: (direction: number) => void;
}

/**
 * Props for the usePaginatorArrow hook.
 */
export interface UsePaginatorArrowProps {
  /** Name of the currently selected item */
  currentSelected: string;
  /** Array of child items */
  childItems: PaginatorChildItem[];
  /** Scroll handler */
  onScroll: (direction: number) => void;
}

/**
 * Props for the usePaginatorList hook.
 */
export interface UsePaginatorListProps {
  /** Name of the currently selected item */
  currentSelected: string;
  /** Array of child items */
  childItems: PaginatorChildItem[];
}

/**
 * Props for the ScrollBar component.
 */
export interface ScrollBarProps {
  /** Scroll handler that receives offset and returns whether scroll was accepted */
  onScroll: (offset: number) => boolean | void;
}

/**
 * Props for the useScrollOffset hook.
 */
export interface UseScrollOffsetProps {
  /** Name of the currently selected item */
  currentSelected: string;
  /** Array of child items */
  childItems: PaginatorChildItem[];
  /** Number of items to display at once */
  displayNums: number;
}

/**
 * Props for the useWheelEvent hook.
 */
export interface UseWheelEventProps {
  /** Array of child items */
  childItems: unknown[];
  /** Number of items to display at once */
  displayNums: number;
  /** Function to reset scroll offset */
  resetScrollOffset: () => void;
  /** Scroll handler */
  onScroll: (steps: number) => void;
}
