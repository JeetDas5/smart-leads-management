import {
  RouterProvider,
} from "@tanstack/react-router";

import { router } from "./routes";
import { Providers } from "@/components/providers";

function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}

export default App;