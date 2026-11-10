import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { AuthProvider } from "@/hooks/useAuth";
import { AppSettingsProvider } from "@/hooks/useAppSettings";
import InstallPrompt from "@/components/feature/InstallPrompt";


function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AppSettingsProvider>
        <AuthProvider>
          <BrowserRouter basename={__BASE_PATH__}>
            <AppRoutes />
            <InstallPrompt />
          </BrowserRouter>
        </AuthProvider>
      </AppSettingsProvider>
    </I18nextProvider>
  );
}

export default App;