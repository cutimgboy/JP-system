import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./routes";

export default function App() {
  // Test
  return (
    <>
      <RouterProvider router={router} />
      <Toaster theme="dark" position="top-center" />
    </>
  );
}