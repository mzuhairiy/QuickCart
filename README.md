# QuickCart - A simple eCommerce website

QuickCart is a **Next.js eCommerce** project inspired by **github.com/GreatStack**. </br>
It provides a modern, fast and customizable shopping UI. <br/>
As a QA Engineer, I'm learning to implement automated tests and set up a CI/CD pipeline.

---

## Features

-   Built with **Next.js + Tailwind CSS**
-   Responsive design
-   Reusable components
-   Customizable layouts and colors

---

## Getting Started

1. Clone the repo

    ```bash
    git clone https://github.com/GreatStackDev/QuickCart.git
    cd QuickCart
    ```

2. Install dependencies

    ```bash
    npm install
    ```

3. Run locally

    ```bash
    npm run dev
    ```
---

## Testing

### E2E Tests

This project uses Playwright for end-to-end testing with mocked Clerk authentication.

**Run all E2E tests:**
```bash
npm run test:e2e
```

**Run specific test file:**
```bash
npx playwright test tests/e2e/auth-flow.spec.js
```

**Run tests in headed mode (see browser):**
```bash
npx playwright test --headed
```

**View test report:**
```bash
npx playwright show-report
```

**Test structure:**
- `tests/e2e/` - Test files
- `tests/fixtures/` - Reusable fixtures and test data
- `tests/utils/` - Helper functions

---

## License

This project is licensed under the **MIT License**.
