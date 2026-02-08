import { render, screen, fireEvent, act } from "@testing-library/react";
import { ThemeSwitcher } from "@/src/components/themeSwitcher";

const mockSetTheme = jest.fn();
jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: mockSetTheme,
    resolvedTheme: "light",
  }),
}));

describe("ThemeSwitcher", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("Should Render And Toggle Theme On Click", () => {
    render(<ThemeSwitcher />);

    act(() => {
      jest.runAllTimers();
    });

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });
});
