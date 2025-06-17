# Stake Crash Analytics

Unlock the secrets of the global Stake Crash game with this easy-to-use analytics tool! Simply upload your game history JSON file and get instant, in-depth insights into patterns, streaks, and crash points.

---

## Features

- **Global Crash History Analysis:** Dive deep into the complete history of the Stake Crash game, not just your personal bets.
- **Customizable Highlighting:** Set your desired crashpoint threshold to easily spot "green" (higher multiplier) crashes.
- **Streak Tracking:** See the number of non-green crashes that occurred before each highlighted crash.
- **Max Gap Identification:** Discover the longest recorded streak of non-green crashes, helping you identify the most extended "dry spells" in the game's history.
- **Intuitive Interface:** A clean, single-page application designed for quick analysis.

---

## How It Works

This tool processes the JSON history file directly from the Stake Crash game. It identifies patterns and calculates statistics based on the global game outcomes.

---

## Getting Started

Follow these simple steps to analyze the Stake Crash history:

1.  **Get the History File:**

    - **Copy Code:** Click the "Copy Code" button on the app's page.
    - **Go to Stake Crash:** Open your web browser and navigate to the Stake Crash game page on Stake.com.
    - **Open Browser Console:**
      - **Windows/Linux:** Press `Ctrl + Shift + J`
      - **Mac:** Press `Cmd + Option + J`
    - **Paste & Download:** In the console, paste the copied code and press `Enter`. A JSON file containing the game's history will automatically download to your computer.

2.  **Upload the File:**

    - On the app's page, simply **drag and drop** the downloaded JSON file into the designated upload area, or use the file input to select it.

3.  **View Analytics:**
    - Once uploaded, the table will populate with crash history chips.
    - Use the **"Highlight Crashes from or equal to"** input to set your desired multiplier threshold. Crashes at or above this value will be highlighted green.
    - Observe the numbers below the green chips to see the **streak length** (number of non-green crashes) leading up to that green crash.
    - At the top of the table, you'll see the **"Record Gap Between Green Crashes,"** indicating the longest observed streak of non-green crashes.

---

## Technologies Used

- **React:** For building the user interface.
- **Next.js:** The React framework for production.
- **Tailwind CSS:** For efficient and highly customizable styling.
- **`@heroui/react` & `@heroui/chip`:** UI components for a polished look.
- **`lucide-react`:** For elegant icons.

---

## Contributing

We welcome contributions! If you have suggestions for improvements, feature requests, or find a bug, feel free to open an issue or submit a pull request.

---

## License

This project is open-source and available under the [MIT License](LICENSE).

---
