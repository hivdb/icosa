import React from 'react';
import style from './style.module.scss';

const levelHumanStrings = {
  CRITICAL: 'Critical',
  SEVERE_WARNING: 'Severe warning',
  WARNING: 'Warning',
  NOTE: 'Note'
} as const;

const levelOrders = [
  'CRITICAL',
  'SEVERE_WARNING',
  'WARNING',
  'NOTE'
] as const;

export type ValidationLevel = typeof levelOrders[number];

export interface ValidationResult {
  level: ValidationLevel;
  message: string;
}

export interface ValidationReportProps {
  /**
   * Array of validation results to display. Results are automatically sorted
   * by severity from critical to note.
   */
  validationResults: ValidationResult[];
  /** Optional placeholder shown when there are no validation results. */
  placeholder?: string;
}

/**
 * ValidationReport lists validation results in order of severity. Each item
 * is rendered with a class representing its level. A placeholder message can
 * be shown when there are no results.
 */
export default function ValidationReport({
  validationResults,
  placeholder
}: ValidationReportProps) {
  const results = [...validationResults].sort(
    (r1, r2) => levelOrders.indexOf(r1.level) - levelOrders.indexOf(r2.level)
  );

  return (
    <section className={style['validation-report']}>
      {results.length > 0 ? (
        <ul>
          {results.map(({level, message}, idx) => (
            <li
              key={idx}
              className={style[`level-${level.toLowerCase().replace('_', '-')}`]}
            >
              <strong>{levelHumanStrings[level]}</strong>: {message}
            </li>
          ))}
        </ul>
      ) : null}
      {results.length === 0 && placeholder ? (
        <div className={style.placeholder}>{placeholder}</div>
      ) : null}
    </section>
  );
}
