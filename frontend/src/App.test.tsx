import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the product name', () => {
    render(<App />);
    expect(screen.getByText('KHOJI')).toBeInTheDocument();
  });
});
