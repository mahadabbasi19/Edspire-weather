import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Reminders } from "./Reminders";
const showNotification = vi.fn().mockResolvedValue(undefined);
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("isSecureContext", true);
  vi.stubGlobal("Notification", {
    permission: "granted",
    requestPermission: vi.fn().mockResolvedValue("granted"),
  });
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: {
      getRegistration: vi
        .fn()
        .mockResolvedValue({ active: {}, showNotification }),
    },
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
it("enables a supported active-app reminder, sends a worker test notification, and disables", async () => {
  render(<Reminders city="Karachi" />);
  fireEvent.click(
    screen.getByRole("button", { name: "Allow active-app reminder" }),
  );
  await screen.findByRole("button", { name: "Turn off active-app reminder" });
  fireEvent.click(
    screen.getByRole("button", { name: "Send a test notification" }),
  );
  await screen.findByText("Test notification sent to your browser.");
  expect(showNotification).toHaveBeenCalledWith(
    "Your outlook is a click away",
    expect.objectContaining({ body: "Check the latest weather for Karachi." }),
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Turn off active-app reminder" }),
  );
  expect(
    screen.getByRole("button", { name: "Allow active-app reminder" }),
  ).toBeInTheDocument();
  expect(localStorage.getItem("wb-reminder-enabled")).toBe("false");
});
it("rejects non-morning time on blur and submission", async () => {
  render(<Reminders city="Karachi" />);
  const time = screen.getByLabelText(/Morning reminder/);
  fireEvent.change(time, { target: { value: "14:00" } });
  fireEvent.blur(time);
  expect(
    screen.getByText("Choose a morning time between 00:00 and 11:59."),
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Allow active-app reminder" }),
  );
  expect(Notification.requestPermission).not.toHaveBeenCalled();
});
