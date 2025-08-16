# **App Name**: RollCompare

## Core Features:

- Dice Roll Input: Allow the user to input multiple dice roll formulas (e.g., 2D6, 1D20+3) to be compared.
- Parse Roll Definitions: Parse each dice roll definition into a standardized representation so the rolls can be simulated.
- Dice Roll Simulation: Run simulations for each inputted dice roll formula by sampling from dice pools.
- Statistical Calculation: Calculate min, max, average, median, mode, standard deviation, and 90th percentile (p90) from the simulated dice roll data.
- Statistics Display: Present the calculated statistics for each dice roll formula in a clear and organized tabular format, with tooltips that give the actual formulas used, etc.
- Distribution Chart: Generate and display interactive distribution charts for each dice roll formula, visually comparing their probability distributions.
- Roll Suggestion: Based on user defined goals and given input constraints (e.g., average > 10, maximum < 25), provide suggestions of optimal roll definitions to the user using a tool that simulates many rolls and returns possible results.

## Style Guidelines:

- Primary color: Saturated purple (#A050A0) for a mystical and engaging feel, reminiscent of tabletop gaming.
- Background color: Light gray (#E0E0E0), a very low saturation version of the purple hue.
- Accent color: Yellow (#FFD700), an analogous color to the primary, but brighter and with more saturation.
- Font: 'Inter', a grotesque-style sans-serif, for all text on the site.
- Use dice-themed icons for interactive elements. E.g. settings can use gears/cogs combined with a stylized d6
- Use a grid-based layout for the input fields and results display, ensuring responsiveness on different devices.
- Add subtle animations, like dice rolling when the user changes input parameters.