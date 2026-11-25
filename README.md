# FINORA — Personal Finance Manager

**Take control of your money. Understand your habits. Plan your future.**

FINORA is a modern web-based personal finance management application designed to help users manage their money, track transactions, monitor budgets, and achieve their financial goals.

With a clean interface and intuitive experience, FINORA makes personal financial management simpler and more organized.

##  Features

- **Dashboard** — View your financial overview, including balance, income, expenses, and recent activity.
- **Transaction Management** — Add, edit, delete, and categorize income and expenses.
- **Budget Planner** — Set spending limits and monitor your budget.
- **Analytics** — Understand your financial habits through visual charts and reports.
- **Savings Goals** — Create and track progress toward your savings targets.
- **Reports** — Review financial activity and export transaction data to CSV.
- **Settings** — Customize your application preferences.

##  Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type safety |
| Vite | Development and build tool |
| Tailwind CSS | Styling |
| Lucide React | Icons |
| Recharts | Data visualization |
| Local Storage / IndexedDB | Local data persistence |

*The technology list should reflect the actual implementation.*

##  Getting Started

### Prerequisites

Make sure you have installed:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- Git (optional)

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/your-username/finora.git
   ```

2. Navigate to the project directory:

   ```bash
   cd finora
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL displayed in your terminal, usually:

   ```text
   http://localhost:5173
   ```

##  Project Structure

```text
FINORA/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── features/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   ├── assets/
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

*The structure above is an example and may differ from the actual project.*

##  Data & Privacy

FINORA is designed with a local-first approach.

Financial data is intended to be stored locally in the user's browser rather than automatically sent to an external server.

**Important:** Clearing browser storage may remove locally stored financial data. Always keep a backup when available.

##  Project Goals

FINORA aims to:

- Encourage better financial awareness.
- Make expense tracking easier.
- Help users build budgeting habits.
- Provide a clear overview of personal finances.
- Make financial planning accessible through a simple interface.

## 🗺️ Roadmap

- [x] Initial project concept
- [ ] Dashboard
- [ ] Transaction management
- [ ] Budget planning
- [ ] Financial analytics
- [ ] Savings goals
- [ ] CSV export
- [ ] Data backup and restore
- [ ] UI/UX improvements

##  Contributing

Contributions, suggestions, and feedback are welcome.

If you find a bug or have an idea for improvement, feel free to open an issue or submit a pull request.

##  License

This project is currently developed for educational and personal portfolio purposes.

---

<p align="center">
  **FINORA**
  <br />
  <em>Manage smarter. Live better.</em>
</p>
