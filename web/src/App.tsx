import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import routes from "./routes";
import { Layout } from "./components/Layout";
import { Loader } from "./components/Loader";

function App() {
  return (
    <Routes>
      {routes.map(({ path, Component, layout = "default" }) => {
        const element = (
          <Suspense fallback={<Loader />}>
            <Component />
          </Suspense>
        );

        if (layout === "plain") {
          return <Route key={path} path={path} element={element} />;
        }

        return (
          <Route key={path} path={path} element={<Layout>{element}</Layout>} />
        );
      })}
    </Routes>
  );
}

export default App;
