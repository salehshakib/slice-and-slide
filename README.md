# Slice & Slide

Slice & Slide is an interactive creative canvas where you can bring your geometric ideas to life. Create, slice, and rearrange colorful boxes in a playful and intuitive environment. It's a simple yet engaging application that demonstrates the power of React for building dynamic user interfaces.

![Slice & Slide Screenshot](https://placehold.co/800x450.png)
*A placeholder image of the application in action.*

## ✨ Features

- **Create Boxes:** Click and drag on the canvas to draw new colored rectangles of any size.
- **Slice Dynamically:** Simply click anywhere on the canvas. A crosshair follows your mouse, and your click slices all existing boxes both horizontally and vertically along those lines.
- **Minimum Size:** Slicing is prevented if it would result in a piece smaller than 10x10 pixels, keeping the canvas clean and manageable.
- **Drag & Drop:** Easily move and rearrange any sliced piece by clicking and dragging it.
- **Reset Canvas:** A convenient reset button instantly clears the canvas, allowing you to start fresh.
- **Responsive Design:** The canvas adapts smoothly to different screen sizes.

## 🚀 How to Use

1.  **Create a box**: Press your mouse button down on the canvas, drag to define the size, and release.
2.  **Slice boxes**: Move your mouse to position the red crosshair guides. Click to slice all shapes along those guides.
3.  **Move a piece**: Click and hold on any piece, drag it to a new position, and release.
4.  **Start over**: Click the "Reset" button (the counter-clockwise arrow) in the top-right corner.

## 🛠️ Tech Stack

This project is built with a modern, production-ready tech stack:

-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **UI Library:** [React](https://react.dev/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Icons:** [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (v18 or later)
-   npm or yarn

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/your-username/slice-and-slide.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd slice-and-slide
    ```
3.  Install NPM packages:
    ```sh
    npm install
    ```

### Running the Development Server

To start the app in development mode, run:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start editing the main page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.
