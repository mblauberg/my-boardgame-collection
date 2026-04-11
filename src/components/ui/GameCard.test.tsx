import { render, screen } from "@testing-library/react";
import { GameCard } from "./GameCard";

describe("GameCard", () => {
  it("renders the game title inside a glass info panel", () => {
    render(<GameCard title="Brass_Birmingham" />);

    const title = screen.getByRole("heading", { name: "Brass Birmingham" });
    expect(title.closest(".game-card-title-glass")).toBeInTheDocument();
  });

  it("does not render an empty details block when no metadata is available", () => {
    const { container } = render(<GameCard title="Azul" />);
    expect(container.querySelector("div.space-y-2\\.5")).not.toBeInTheDocument();
  });

  it("uses a 4:5 image frame to show cover art more prominently", () => {
    render(<GameCard title="Heat" />);
    const image = screen.getByAltText("Cover art for Heat");
    expect(image.parentElement).toHaveClass("aspect-[4/5]");
  });

  it("uses a more compact title style so the glass panel covers less artwork", () => {
    render(<GameCard title="Twilight Imperium Fourth Edition" />);
    const title = screen.getByRole("heading", { name: "Twilight Imperium Fourth Edition" });
    expect(title).toHaveClass("text-base", "md:text-xl", "line-clamp-2");
  });

  it("uses a larger corner radius for a softer editorial look", () => {
    const { container } = render(<GameCard title="Wingspan" />);
    expect(container.querySelector("article")).toHaveClass("rounded-2xl");
  });

  it("adds a full hero overlay for image/title synergy", () => {
    const { container } = render(<GameCard title="Terraforming Mars" />);
    expect(container.querySelector(".game-card-hero-overlay")).toBeInTheDocument();
  });

  it("keeps the compact title typography while removing hardcoded dark-mode rgb text", () => {
    render(<GameCard title="Ark Nova" />);
    const title = screen.getByRole("heading", { name: "Ark Nova" });
    expect(title).not.toHaveClass("dark:text-[rgb(245_238_232)]");
    expect(title).toHaveClass("md:text-xl");
  });

  it("uses tokenized surface classes instead of hardcoded dark-mode rgb values", () => {
    const { container } = render(<GameCard title="Ark Nova" />);
    const card = container.querySelector("article");

    expect(card).not.toHaveClass("dark:bg-[rgb(28_27_27)]");
  });

  it("renders rating icon using filled material-symbol class instead of inline fill styles", () => {
    render(<GameCard title="Ark Nova" rating={8.2} />);

    const ratingIcon = screen.getByText("star");
    expect(ratingIcon).toHaveClass("material-symbols-filled");
    expect(ratingIcon).not.toHaveAttribute("style");
  });

  it("renders badge labels with shared status badge styling", () => {
    render(<GameCard title="Ark Nova" badge="Saved" />);

    expect(screen.getByText("Saved")).toHaveClass("inline-flex", "glass-badge");
  });

  it("renders a compact details block when metadata is present", () => {
    const { container } = render(
      <GameCard
        title="Wingspan"
        description="Engine building with birds."
        players="1-5 Players"
      />,
    );

    expect(container.querySelector("div.space-y-2\\.5")).toBeInTheDocument();
  });
});
