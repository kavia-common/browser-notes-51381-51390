import { render, screen } from '@testing-library/react';
import App from './App';

test('renders notes header and new note button', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /notes/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /\+ new note/i })).toBeInTheDocument();
});
