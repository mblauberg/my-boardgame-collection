import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./theme";

function ThemeProbe() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button type="button" onClick={toggleTheme}>
      {theme}
    </button>
  );
}

describe("ThemeProvider", () => {
  it("applies the saved theme to the document and persists toggles", async () => {
    localStorage.setItem("theme", "dark");
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    expect(document.documentElement).toHaveClass("dark");
    expect(document.body).toHaveClass("dark");
    expect(screen.getByRole("button", { name: "dark" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "dark" }));

    expect(document.documentElement).toHaveClass("light");
    expect(document.body).toHaveClass("light");
    expect(localStorage.getItem("theme")).toBe("light");
  });
});
