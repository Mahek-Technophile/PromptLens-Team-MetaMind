import './globals.css';

export const metadata = {
  title: 'PromptLens - AI Prompt Optimizer',
  description: 'Optimize your prompts to reduce AI resource usage and save energy',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
