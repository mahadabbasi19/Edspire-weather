import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CitySearch } from "./CitySearch";
import { searchCities } from "../services/cities";
vi.mock("../services/cities", () => ({
  geoConfigured: true,
  searchCities: vi.fn(),
}));
afterEach(() => vi.clearAllMocks());
it("validates empty submit and unresolved text on blur", () => {
  render(<CitySearch onSelect={vi.fn()} />);
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByText("Enter a city name.")).toBeInTheDocument();
  const input = screen.getByRole("combobox");
  fireEvent.change(input, { target: { value: "Paris" } });
  fireEvent.blur(input);
  expect(
    screen.getByText("Choose a city from the suggestions."),
  ).toBeInTheDocument();
});
it("debounces and supports keyboard selection", async () => {
  const selected = vi.fn();
  vi.mocked(searchCities).mockResolvedValue([
    {
      id: "paris",
      name: "Paris",
      country: "France",
      latitude: 48,
      longitude: 2,
    },
  ]);
  render(<CitySearch onSelect={selected} />);
  const input = screen.getByRole("combobox");
  fireEvent.change(input, { target: { value: "Paris" } });
  expect(searchCities).not.toHaveBeenCalled();
  await screen.findByRole("option");
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.submit(input.closest("form")!);
  expect(selected).toHaveBeenCalledWith(
    expect.objectContaining({ name: "Paris" }),
  );
  expect(input).toHaveValue("");
});
it("announces no results and provider errors", async () => {
  vi.mocked(searchCities).mockResolvedValue([]);
  render(<CitySearch onSelect={vi.fn()} />);
  const input = screen.getByRole("combobox");
  fireEvent.change(input, { target: { value: "xx" } });
  await screen.findByText("No cities found. Try a different spelling.");
  vi.mocked(searchCities).mockRejectedValue(
    new Error("Request limit reached. Please wait."),
  );
  fireEvent.change(input, { target: { value: "xxx" } });
  await waitFor(() =>
    expect(
      screen.getByText("Request limit reached. Please wait."),
    ).toBeInTheDocument(),
  );
});
