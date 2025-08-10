import {render, screen} from '@testing-library/react';
import ValidationReport, {ValidationResult} from './validation-report';

describe('ValidationReport', () => {
  test('sorts validation results by severity', () => {
      const results: ValidationResult[] = [
        {level: 'WARNING', message: 'warn'},
        {level: 'CRITICAL', message: 'crit'}
      ];
    render(<ValidationReport validationResults={results} />);
    const items = screen.getAllByRole('listitem');
    expect(items[0].textContent).toContain('Critical');
    expect(items[1].textContent).toContain('Warning');
  });

  test('shows placeholder when no results', () => {
    render(
      <ValidationReport validationResults={[]} placeholder="No issues" />
    );
    expect(screen.getByText('No issues')).not.toBeNull();
  });
});
