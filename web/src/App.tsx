import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import routes from "./routes";
import { Layout } from "./components/Layout";
import { Loader } from "./components/Loader";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {routes.map(({ path, Component, layout = "default", protected: isProtected }) => {
        const element = (
          <Suspense fallback={<Loader />}>
            <Component />
          </Suspense>
        );

        // Rutas protegidas con autenticación
        if (isProtected) {
          const protectedElement = <ProtectedRoute>{element}</ProtectedRoute>;
          
          if (layout === "plain") {
            return <Route key={path} path={path} element={protectedElement} />;
          }

          return (
            <Route 
              key={path} 
              path={path} 
              element={<Layout>{protectedElement}</Layout>} 
            />
          );
        }

        // Rutas públicas (login, register)
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
