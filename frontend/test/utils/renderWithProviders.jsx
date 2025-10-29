// test/utils/renderWithProviders.jsx
import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";

export function renderWithProviders(ui, { route = "/" } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
}
