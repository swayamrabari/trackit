# TrackIt - Personal Finance Tracker

![TrackIt Logo](/public/trackit.svg)

TrackIt is a comprehensive personal finance management application that helps you track your income, expenses, investments, and savings. With intuitive visualizations and budget management tools, TrackIt gives you insights into your financial habits and helps you make informed decisions.

## Features

- **Entry Management**: Add and manage financial entries with date, type, category, and amount
- **Summary Dashboard**: Get an overview of your financial status with visual indicators
- **Budget Management**: Create, update, and delete budgets for different categories
- **Data Visualization**: View your financial data through interactive charts and graphs
- **Category Management**: Customize categories for different types of transactions
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop

## Technology Stack

- **Frontend**: React 18, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Charts**: Recharts
- **UI Components**: Radix UI with Shadcn UI
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/trackit.git
   cd trackit
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
# or
yarn build
```

<!-- tell that development is active and can be updated -->

## Project Structure (Active Development - Subject to Change)

```
trackit/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── charts/       # Chart components
│   │   └── ui/           # UI primitives
│   ├── constants/        # Application constants
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components
│   └── store/            # Zustand state stores
├── index.html            # Entry HTML file
├── tailwind.config.js    # Tailwind configuration
└── tsconfig.json         # TypeScript configuration
```

## Future Enhancements

- AI-powered insights for financial planning
- Multi-currency support
- Export/import functionality
- Financial goal tracking
- Budget forecasting

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Recharts](https://recharts.org/en-US/) for chart components
- [Radix UI](https://www.radix-ui.com/) for accessible UI primitives
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Zustand](https://github.com/pmndrs/zustand)
