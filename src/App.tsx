import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";

// Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Utentes from "./pages/Utentes";
import UtenteDetalhes from "./pages/UtenteDetalhes";
import Agenda from "./pages/Agenda";
import Dentistas from "./pages/Dentistas";
import Procedimentos from "./pages/Procedimentos";
import Faturas from "./pages/Faturas";
import FaturaDetalhes from "./pages/FaturaDetalhes";
import Configuracoes from "./pages/Configuracoes";
import Assinatura from "./pages/Assinatura";
import BusinessIntelligence from "./pages/BusinessIntelligence";
import Avaliacoes from "./pages/Avaliacoes";
import Custos from "./pages/Custos";

/**
 * DentCarePro SaaS - Router Principal
 * 
 * Rotas organizadas:
 * - / : Landing page pública
 * - /dashboard : Dashboard principal (autenticado)
 * - /utentes : Gestão de utentes
 * - /agenda : Agenda de consultas
 * - /dentistas : Gestão de dentistas
 * - /procedimentos : Catálogo de procedimentos
 * - /faturas : Gestão de faturas
 * - /configuracoes : Configurações da clínica
 * - /assinatura : Gestão de assinatura SaaS
 * - /bi : Business Intelligence e Analytics
 */

function Router() {
  return (
    <Switch>
      {/* Landing page pública */}
      <Route path="/" component={Home} />

      {/* Rotas autenticadas com DashboardLayout */}
      <Route path="/dashboard">
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </Route>

      <Route path="/utentes">
        <DashboardLayout>
          <Utentes />
        </DashboardLayout>
      </Route>

      <Route path="/utentes/:id">
        {(params) => (
          <DashboardLayout>
            <UtenteDetalhes utenteId={parseInt(params.id)} />
          </DashboardLayout>
        )}
      </Route>

      <Route path="/agenda">
        <DashboardLayout>
          <Agenda />
        </DashboardLayout>
      </Route>

      <Route path="/dentistas">
        <DashboardLayout>
          <Dentistas />
        </DashboardLayout>
      </Route>

      <Route path="/procedimentos">
        <DashboardLayout>
          <Procedimentos />
        </DashboardLayout>
      </Route>

      <Route path="/faturas">
        <DashboardLayout>
          <Faturas />
        </DashboardLayout>
      </Route>

      <Route path="/faturas/:id">
        {(params) => (
          <DashboardLayout>
            <FaturaDetalhes faturaId={parseInt(params.id)} />
          </DashboardLayout>
        )}
      </Route>

      <Route path="/configuracoes">
        <DashboardLayout>
          <Configuracoes />
        </DashboardLayout>
      </Route>

      <Route path="/assinatura">
        <DashboardLayout>
          <Assinatura />
        </DashboardLayout>
      </Route>

      <Route path="/bi">
        <DashboardLayout>
          <BusinessIntelligence />
        </DashboardLayout>
      </Route>

      <Route path="/avaliacoes">
        <DashboardLayout>
          <Avaliacoes />
        </DashboardLayout>
      </Route>

      <Route path="/custos">
        <DashboardLayout>
          <Custos />
        </DashboardLayout>
      </Route>

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
