import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../pages/auth/LoginScreen';
import MainLayout from '../components/layout/MainLayout';
import DashboardScreen from '../pages/dashboard/DashboardScreen';

// Placeholder - irás reemplazando con los componentes reales
const Placeholder = ({ name }) => (
  <div style={{ padding: 32, fontSize: 24 }}>{name} — en construcción</div>
);

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-screen">Cargando...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicLoginRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="loading-screen">Cargando...</div>;

  return isAuthenticated ? <Navigate to="/" replace /> : <LoginScreen />;
};

export default function AppRouter() {
  const { user } = useAuth();
  const role = user?.role;

  const isAdmin   = role === 'admin';
  const isAdminOrAdministrativo = isAdmin || role === 'administrativo';
  const isMedico  = role === 'medico';
  const isEnfermeria = role === 'enfermero' || role === 'enfermeria';
  const isEstudios = role === 'estudios';

  return (
    <Routes>
      <Route path="/login" element={<PublicLoginRoute />} />

      <Route
        path="/*"
        element={
          <PrivateRoute>
            <MainLayout>
              <Routes>
                {/* Dashboard */}
                <Route path="/" element={<DashboardScreen />} />

                {/* Admin / Administrativo */}
                {isAdminOrAdministrativo && <>
                  <Route path="/admin"           element={<Placeholder name="Admin" />} />
                  <Route path="/pacientes"        element={<Placeholder name="Pacientes" />} />
                  <Route path="/pacientes/:id"    element={<Placeholder name="Detalle Paciente" />} />
                  <Route path="/nuevo-paciente"   element={<Placeholder name="Nuevo Paciente" />} />
                  <Route path="/censo"            element={<Placeholder name="Censo" />} />
                  <Route path="/corte-caja"       element={<Placeholder name="Corte Caja" />} />
                  <Route path="/camas"            element={<Placeholder name="Camas" />} />
                </>}

                {/* Médico */}
                {(isAdmin || isMedico) && <>
                  <Route path="/medico"                    element={<Placeholder name="Panel Médico" />} />
                  <Route path="/medico/paciente/:id"       element={<Placeholder name="Detalle Paciente" />} />
                  <Route path="/medico/historia-clinica"   element={<Placeholder name="Historia Clínica" />} />
                  <Route path="/medico/signos-vitales"     element={<Placeholder name="Signos Vitales" />} />
                  <Route path="/medico/nota-medica"        element={<Placeholder name="Nota Médica" />} />
                  <Route path="/medico/diagnostico"        element={<Placeholder name="Diagnóstico" />} />
                  <Route path="/medico/receta"             element={<Placeholder name="Receta" />} />
                  <Route path="/medico/lab-exams"          element={<Placeholder name="Exámenes Lab" />} />
                  <Route path="/medico/imaging-exams"      element={<Placeholder name="Exámenes Gabinete" />} />
                  <Route path="/medico/imprimir"           element={<Placeholder name="Imprimir Docs" />} />
                  <Route path="/medico/resultados"         element={<Placeholder name="Resultados" />} />
                </>}

                {/* Enfermería */}
                {(isAdmin || isEnfermeria) && <>
                  <Route path="/enfermeria"                  element={<Placeholder name="Panel Enfermería" />} />
                  <Route path="/enfermeria/paciente/:id"     element={<Placeholder name="Detalle Paciente" />} />
                  <Route path="/enfermeria/signos-vitales"   element={<Placeholder name="Signos Vitales" />} />
                  <Route path="/enfermeria/nota"             element={<Placeholder name="Nota Enfermería" />} />
                  <Route path="/enfermeria/medicamentos"     element={<Placeholder name="Medicamentos" />} />
                </>}

                {/* Estudios */}
                {(isAdmin || isMedico || isEstudios) && <>
                  <Route path="/estudios"                    element={<Placeholder name="Panel Estudios" />} />
                  <Route path="/estudios/subir-resultado"    element={<Placeholder name="Subir Resultado" />} />
                  <Route path="/estudios/ver-lab"            element={<Placeholder name="Ver Resultado Lab" />} />
                  <Route path="/estudios/ver-gab"            element={<Placeholder name="Ver Resultado Gab" />} />
                  <Route path="/estudios/editar-lab"         element={<Placeholder name="Editar Lab" />} />
                  <Route path="/estudios/editar-gab"         element={<Placeholder name="Editar Gab" />} />
                </>}

                {/* Config — solo admin */}
                {isAdmin && <>
                  <Route path="/config"                element={<Placeholder name="Configuración" />} />
                  <Route path="/config/general"        element={<Placeholder name="Config General" />} />
                  <Route path="/config/usuarios"       element={<Placeholder name="Config Usuarios" />} />
                  <Route path="/config/camas"          element={<Placeholder name="Config Camas" />} />
                  <Route path="/config/servicios"      element={<Placeholder name="Config Servicios" />} />
                  <Route path="/config/automatizacion" element={<Placeholder name="Config Automatización" />} />
                  <Route path="/config/backup"         element={<Placeholder name="Config Backup" />} />
                  <Route path="/config/perfil"         element={<Placeholder name="Config Perfil" />} />
                </>}

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MainLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}