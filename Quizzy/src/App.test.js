import { render, screen } from '@testing-library/react';
import App from './App';

test('renders without crashing', () => {
  render(<App />);
  const appElement = screen.getByText(/Quizzy/i);
  expect(appElement).toBeInTheDocument();
});
