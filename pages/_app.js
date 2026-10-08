import "@primer/primitives/dist/css/functional/themes/light.css";

import { BaseStyles, ThemeProvider } from "@primer/react";

export default function App({ Component }) {
  return (
    <ThemeProvider>
      <BaseStyles>
        <fieldset>
          <Component />
        </fieldset>
      </BaseStyles>
    </ThemeProvider>
  );
}
