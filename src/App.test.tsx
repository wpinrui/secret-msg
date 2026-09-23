import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "./App";

function fill(label: string, values: string[][]) {
  values.forEach((row, r) => {
    row.forEach((value, c) => {
      fireEvent.change(
        screen.getByLabelText(`${label} row ${r + 1} column ${c + 1}`),
        { target: { value } },
      );
    });
  });
}

function cellsOf(label: string): string[] {
  const panel = screen.getByRole("tabpanel");
  const matrix = within(panel).getByRole("group", { name: label });
  return [...matrix.querySelectorAll(".matrix-cell")].map(
    (el) => el.textContent ?? "",
  );
}

afterEach(cleanup);

describe("App", () => {
  it("encrypts a message as C = ET and hands C to Decrypt", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Hi!" },
    });
    expect(screen.getByLabelText("Message")).toHaveProperty("value", "hi");
    fill("E", [
      ["2", "1"],
      ["1", "1"],
    ]);
    // T = [8; 9], C = [25; 17]
    expect(cellsOf("C")).toEqual(["25", "17"]);

    fireEvent.click(screen.getByRole("button", { name: "Decrypt →" }));
    expect(screen.getByRole("tab", { name: "Decrypt" })).toHaveProperty(
      "ariaSelected",
      "true",
    );
    expect(screen.getByLabelText("C row 1 column 1")).toHaveProperty(
      "value",
      "25",
    );
    expect(screen.getByRole("button", { name: "Crack" })).toBeTruthy();
  });

  it("flags a singular key", () => {
    render(<App />);
    fill("E", [
      ["2", "4"],
      ["1", "2"],
    ]);
    expect(screen.getByText("det E = 0")).toBeTruthy();
  });

  it("decrypts with a fractional D and flags entries of T out of range", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("tab", { name: "Decrypt" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove column" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove column" }));
    // E = [3 1; 1 1], T = [8; 9] ("hi"), C = [33; 17], D = E⁻¹ = [1/2 -1/2; -1/2 3/2]
    fill("C", [["33"], ["17"]]);
    fill("D", [
      ["1/2", "-1/2"],
      ["-1/2", "3/2"],
    ]);
    expect(screen.getByText("“hi”")).toBeTruthy();

    fill("D", [
      ["1", "0"],
      ["0", "1"],
    ]);
    expect(
      screen.getByText("T must be whole numbers from 0 to 26"),
    ).toBeTruthy();
  });
});
